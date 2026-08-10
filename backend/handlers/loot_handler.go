package handlers

import (
	"fmt"
	"krankenprep/database"
	"krankenprep/models"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// canAccessCharacterWishlist reports whether userId may view/edit the given
// character's wishlist — either they're the player who claimed that
// character, or they hold loot-council-or-higher on the team. This is where
// "raw wishlists are visible only to the owning player or loot council/admin"
// is actually enforced, not just hidden in the UI.
func canAccessCharacterWishlist(teamId uint, userId uint, characterId uint) bool {
	if isLootCouncilOrAdmin(teamId, userId) {
		return true
	}
	var character models.Character
	if err := database.DB.Preload("Player").First(&character, characterId).Error; err != nil {
		return false
	}
	return character.Player.TeamID == teamId &&
		character.Player.UserID != nil &&
		*character.Player.UserID == userId
}

func getRequestingUser(c *gin.Context) (*models.User, bool) {
	val, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User context is broken"})
		return nil, false
	}
	user, ok := val.(*models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user type"})
		return nil, false
	}
	return user, true
}

// getDifficulty validates the "difficulty" query/body value, writing a 400
// response and returning ok=false if it's neither Heroic nor Mythic.
func getDifficulty(c *gin.Context, value string) (string, bool) {
	switch value {
	case models.DifficultyHeroic, models.DifficultyMythic:
		return value, true
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "difficulty must be Heroic or Mythic"})
		return "", false
	}
}

// recordAuditLog writes an immutable accountability-trail entry. Called
// fire-and-forget after a mutation already succeeded — a logging failure
// shouldn't roll back or fail the user's actual action, just get logged
// server-side for someone to notice.
func recordAuditLog(entry models.LootAuditLog) {
	if err := database.DB.Create(&entry).Error; err != nil {
		log.Printf("failed to record loot audit log: %v", err)
	}
}

// loadItemAuditContext loads the item (with its boss) and character needed
// to build an item-level LootAuditLog entry (wish/obtained events). ok=false
// means one of the lookups failed — callers should just skip logging rather
// than fail the request over it.
func loadItemAuditContext(itemId, characterId uint) (item models.Item, character models.Character, ok bool) {
	if err := database.DB.Preload("Boss").First(&item, itemId).Error; err != nil {
		return item, character, false
	}
	if err := database.DB.First(&character, characterId).Error; err != nil {
		return item, character, false
	}
	return item, character, true
}

// loadBossAuditContext is loadItemAuditContext's counterpart for boss-level
// events (priority/bonus-rolls) that have no item involved.
func loadBossAuditContext(bossId, characterId uint) (boss models.Boss, character models.Character, ok bool) {
	if err := database.DB.First(&boss, bossId).Error; err != nil {
		return boss, character, false
	}
	if err := database.DB.First(&character, characterId).Error; err != nil {
		return boss, character, false
	}
	return boss, character, true
}

type bossLootItem struct {
	ID        uint   `json:"id"`
	WowItemID uint   `json:"wow_item_id"`
	Name      string `json:"name"`
	IconUrl   string `json:"icon_url"`
	ItemLevel uint   `json:"item_level"`
	Slot      string `json:"slot"`
	Wished    bool   `json:"wished"`
	Obtained  bool   `json:"obtained"`
}

type bossLootResponse struct {
	Items      []bossLootItem `json:"items"`
	Priority   *uint          `json:"priority"`
	BonusRolls uint           `json:"bonus_rolls"`
	BonusIds   string         `json:"bonus_ids"`
}

// GetBossLoot returns every item on a boss's loot table that's eligible for
// the given character's specialization, along with that character's
// existing wish/obtained/priority/bonus-roll state for this boss.
func GetBossLoot(c *gin.Context) {
	user, ok := getRequestingUser(c)
	if !ok {
		return
	}

	teamId, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	bossId, err := strconv.ParseUint(c.Param("bossId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid boss ID"})
		return
	}

	characterId, err := strconv.ParseUint(c.Query("character_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or missing character_id"})
		return
	}

	difficulty, ok := getDifficulty(c, c.Query("difficulty"))
	if !ok {
		return
	}

	if !canAccessCharacterWishlist(uint(teamId), user.ID, uint(characterId)) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var character models.Character
	if err := database.DB.First(&character, characterId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "character not found"})
		return
	}
	if character.SpecializationID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "character has no specialization set"})
		return
	}

	var spec models.Specialization
	if err := database.DB.First(&spec, *character.SpecializationID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load specialization"})
		return
	}
	// Deliberately not Preload("WeaponTypes") — confirmed by direct testing
	// that GORM's many2many preload silently drops the associated
	// WeaponType row whose primary key is 0 (Axe (One-Hand), seeded at ID 0
	// to match Blizzard's own subclass numbering — same root cause as the
	// seeding bug fixed in backend/seed/seed.go, but this is an independent
	// bug on the read side, not fixed by that change). Loading the join
	// explicitly via Pluck + a plain WHERE id IN (...) sidesteps GORM's
	// association-scanning code entirely.
	var weaponTypeIDs []uint
	database.DB.Table("specialization_weapon_types").
		Where("specialization_id = ?", spec.ID).
		Pluck("weapon_type_id", &weaponTypeIDs)
	if len(weaponTypeIDs) > 0 {
		database.DB.Where("id IN ?", weaponTypeIDs).Find(&spec.WeaponTypes)
	}

	var boss models.Boss
	if err := database.DB.Preload("Raid.Season").First(&boss, bossId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "boss not found"})
		return
	}
	bonusIds := boss.Raid.Season.MythicBonusIds
	if difficulty == models.DifficultyHeroic {
		bonusIds = boss.Raid.Season.HeroicBonusIds
	}

	var items []models.Item
	if err := database.DB.Where("boss_id = ?", bossId).
		Preload("PrimaryStats").
		Preload("EligibleRoles").
		Find(&items).Error; err != nil {
		log.Printf("Error fetching boss items: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch boss items"})
		return
	}

	var wishes []models.CharacterItemWish
	database.DB.Where("character_id = ? AND difficulty = ?", characterId, difficulty).Find(&wishes)
	wishByItem := make(map[uint]models.CharacterItemWish, len(wishes))
	for _, w := range wishes {
		wishByItem[w.ItemID] = w
	}

	response := bossLootResponse{Items: []bossLootItem{}, BonusIds: bonusIds}
	for _, item := range items {
		if !item.IsEligibleFor(spec) {
			continue
		}
		wish, wished := wishByItem[item.ID]
		response.Items = append(response.Items, bossLootItem{
			ID:        item.ID,
			WowItemID: item.WowItemID,
			Name:      item.Name,
			IconUrl:   item.IconUrl,
			ItemLevel: item.ItemLevel,
			Slot:      item.Slot,
			Wished:    wished,
			Obtained:  wished && wish.Obtained,
		})
	}

	var priority models.CharacterBossPriority
	if err := database.DB.Where("character_id = ? AND boss_id = ? AND difficulty = ?", characterId, bossId, difficulty).First(&priority).Error; err == nil {
		response.Priority = &priority.Priority
	}

	var bonusRolls models.CharacterBossBonusRolls
	database.DB.Where("character_id = ? AND boss_id = ? AND difficulty = ?", characterId, bossId, difficulty).First(&bonusRolls)
	response.BonusRolls = bonusRolls.Count

	c.JSON(http.StatusOK, gin.H{"boss_loot": response})
}

type wishPayload struct {
	CharacterID uint   `json:"character_id"`
	ItemID      uint   `json:"item_id"`
	Difficulty  string `json:"difficulty"`
	Wished      bool   `json:"wished"`
}

// UpsertItemWish toggles whether a character wants a specific item in a
// specific difficulty — wishing an item on Heroic does not wish it on
// Mythic, and vice versa.
func UpsertItemWish(c *gin.Context) {
	user, ok := getRequestingUser(c)
	if !ok {
		return
	}

	teamId, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	var payload wishPayload
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	difficulty, ok := getDifficulty(c, payload.Difficulty)
	if !ok {
		return
	}

	if !canAccessCharacterWishlist(uint(teamId), user.ID, payload.CharacterID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if payload.Wished {
		wish := models.CharacterItemWish{CharacterID: payload.CharacterID, ItemID: payload.ItemID, Difficulty: difficulty}
		if err := database.DB.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "character_id"}, {Name: "item_id"}, {Name: "difficulty"}},
			DoNothing: true,
		}).Create(&wish).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save wish"})
			return
		}
	} else {
		if err := database.DB.Where("character_id = ? AND item_id = ? AND difficulty = ?", payload.CharacterID, payload.ItemID, difficulty).
			Delete(&models.CharacterItemWish{}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to remove wish"})
			return
		}
	}

	if item, character, ok := loadItemAuditContext(payload.ItemID, payload.CharacterID); ok {
		eventType := models.AuditEventItemUnwished
		if payload.Wished {
			eventType = models.AuditEventItemWished
		}
		itemName := item.Name
		recordAuditLog(models.LootAuditLog{
			TeamID:         uint(teamId),
			EventType:      eventType,
			ActingUserID:   user.ID,
			ActingUserBTag: user.BTag,
			CharacterID:    payload.CharacterID,
			CharacterName:  character.Name,
			BossID:         item.BossID,
			BossName:       item.Boss.Name,
			Difficulty:     difficulty,
			ItemID:         &payload.ItemID,
			ItemName:       &itemName,
		})
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

type obtainedPayload struct {
	CharacterID uint   `json:"character_id"`
	ItemID      uint   `json:"item_id"`
	Difficulty  string `json:"difficulty"`
	Obtained    bool   `json:"obtained"`
}

// UpdateItemObtained marks/unmarks an already-wished item as obtained. The
// item must already be wished (obtaining something you never wished for
// isn't a case this UI surfaces) — this only updates an existing row.
func UpdateItemObtained(c *gin.Context) {
	user, ok := getRequestingUser(c)
	if !ok {
		return
	}

	teamId, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	var payload obtainedPayload
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	difficulty, ok := getDifficulty(c, payload.Difficulty)
	if !ok {
		return
	}

	if !canAccessCharacterWishlist(uint(teamId), user.ID, payload.CharacterID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	result := database.DB.Model(&models.CharacterItemWish{}).
		Where("character_id = ? AND item_id = ? AND difficulty = ?", payload.CharacterID, payload.ItemID, difficulty).
		Update("obtained", payload.Obtained)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update obtained state"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "item is not on this character's wishlist"})
		return
	}

	if item, character, ok := loadItemAuditContext(payload.ItemID, payload.CharacterID); ok {
		eventType := models.AuditEventItemUnobtained
		if payload.Obtained {
			eventType = models.AuditEventItemObtained
		}
		itemName := item.Name
		recordAuditLog(models.LootAuditLog{
			TeamID:         uint(teamId),
			EventType:      eventType,
			ActingUserID:   user.ID,
			ActingUserBTag: user.BTag,
			CharacterID:    payload.CharacterID,
			CharacterName:  character.Name,
			BossID:         item.BossID,
			BossName:       item.Boss.Name,
			Difficulty:     difficulty,
			ItemID:         &payload.ItemID,
			ItemName:       &itemName,
		})
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

type priorityPayload struct {
	CharacterID uint   `json:"character_id"`
	Difficulty  string `json:"difficulty"`
	Priority    uint   `json:"priority"`
}

// UpsertBossPriority sets a character's self-reported priority for a boss,
// per difficulty.
func UpsertBossPriority(c *gin.Context) {
	user, ok := getRequestingUser(c)
	if !ok {
		return
	}

	teamId, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	bossId, err := strconv.ParseUint(c.Param("bossId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid boss ID"})
		return
	}

	var payload priorityPayload
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	difficulty, ok := getDifficulty(c, payload.Difficulty)
	if !ok {
		return
	}

	if !canAccessCharacterWishlist(uint(teamId), user.ID, payload.CharacterID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Priorities must be unique per character+difficulty — reject rather
	// than silently reassigning the conflicting boss. Bulk reordering (which
	// legitimately needs to move a priority "through" another boss's
	// current value) goes through ReorderBossPriorities instead, which
	// avoids the conflict entirely via delete-then-recreate.
	var conflict models.CharacterBossPriority
	if err := database.DB.Preload("Boss").
		Where("character_id = ? AND difficulty = ? AND priority = ? AND boss_id != ?",
			payload.CharacterID, difficulty, payload.Priority, bossId).
		First(&conflict).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": fmt.Sprintf("Priority %d is already used by %s", payload.Priority, conflict.Boss.Name)})
		return
	}

	var priority models.CharacterBossPriority
	result := database.DB.Where("character_id = ? AND boss_id = ? AND difficulty = ?", payload.CharacterID, bossId, difficulty).First(&priority)
	if result.Error != nil {
		if result.Error != gorm.ErrRecordNotFound {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to query priority"})
			return
		}
		priority = models.CharacterBossPriority{
			CharacterID: payload.CharacterID,
			BossID:      uint(bossId),
			Difficulty:  difficulty,
			Priority:    payload.Priority,
		}
		if err := database.DB.Create(&priority).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save priority"})
			return
		}
	} else {
		priority.Priority = payload.Priority
		if err := database.DB.Save(&priority).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save priority"})
			return
		}
	}

	if boss, character, ok := loadBossAuditContext(uint(bossId), payload.CharacterID); ok {
		value := payload.Priority
		recordAuditLog(models.LootAuditLog{
			TeamID:         uint(teamId),
			EventType:      models.AuditEventPrioritySet,
			ActingUserID:   user.ID,
			ActingUserBTag: user.BTag,
			CharacterID:    payload.CharacterID,
			CharacterName:  character.Name,
			BossID:         uint(bossId),
			BossName:       boss.Name,
			Difficulty:     difficulty,
			Value:          &value,
		})
	}

	c.JSON(http.StatusOK, priority)
}

type bonusRollsPayload struct {
	CharacterID uint   `json:"character_id"`
	Difficulty  string `json:"difficulty"`
	Count       uint   `json:"count"`
}

// UpsertBonusRolls sets a character's bonus-roll count for a boss — a
// simple manually-adjusted running total, no lockout/reset concept.
func UpsertBonusRolls(c *gin.Context) {
	user, ok := getRequestingUser(c)
	if !ok {
		return
	}

	teamId, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	bossId, err := strconv.ParseUint(c.Param("bossId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid boss ID"})
		return
	}

	var payload bonusRollsPayload
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	difficulty, ok := getDifficulty(c, payload.Difficulty)
	if !ok {
		return
	}

	if !canAccessCharacterWishlist(uint(teamId), user.ID, payload.CharacterID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var bonusRolls models.CharacterBossBonusRolls
	result := database.DB.Where("character_id = ? AND boss_id = ? AND difficulty = ?", payload.CharacterID, bossId, difficulty).First(&bonusRolls)
	previousCount := uint(0)
	if result.Error != nil {
		if result.Error != gorm.ErrRecordNotFound {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to query bonus rolls"})
			return
		}
		bonusRolls = models.CharacterBossBonusRolls{
			CharacterID: payload.CharacterID,
			BossID:      uint(bossId),
			Difficulty:  difficulty,
			Count:       payload.Count,
		}
		if err := database.DB.Create(&bonusRolls).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save bonus rolls"})
			return
		}
	} else {
		previousCount = bonusRolls.Count
		bonusRolls.Count = payload.Count
		if err := database.DB.Save(&bonusRolls).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save bonus rolls"})
			return
		}
	}

	if payload.Count != previousCount {
		if boss, character, ok := loadBossAuditContext(uint(bossId), payload.CharacterID); ok {
			eventType := models.AuditEventBonusRollRemoved
			if payload.Count > previousCount {
				eventType = models.AuditEventBonusRollAdded
			}
			value := payload.Count
			recordAuditLog(models.LootAuditLog{
				TeamID:         uint(teamId),
				EventType:      eventType,
				ActingUserID:   user.ID,
				ActingUserBTag: user.BTag,
				CharacterID:    payload.CharacterID,
				CharacterName:  character.Name,
				BossID:         uint(bossId),
				BossName:       boss.Name,
				Difficulty:     difficulty,
				Value:          &value,
			})
		}
	}

	c.JSON(http.StatusOK, bonusRolls)
}

type itemWisher struct {
	CharacterID uint `json:"character_id"`
	Obtained    bool `json:"obtained"`
}

type bossRollOverviewItem struct {
	ID        uint         `json:"id"`
	WowItemID uint         `json:"wow_item_id"`
	Name      string       `json:"name"`
	IconUrl   string       `json:"icon_url"`
	Wishers   []itemWisher `json:"wishers"`
}

type bossRollOverviewCharacterRoll struct {
	CharacterID uint  `json:"character_id"`
	Priority    *uint `json:"priority"`
	BonusRolls  uint  `json:"bonus_rolls"`
	// PoolSize is how many of this boss's items are eligible for the
	// character's specialization — 0 if the character has no spec set,
	// same as everywhere else this feature treats "no spec" as empty.
	PoolSize uint `json:"pool_size"`
	// Done mirrors the "done with this boss" rule used for the personal
	// plan's banner: every item the character wished for on this
	// boss+difficulty is obtained, and they wished for at least one.
	Done bool `json:"done"`
}

type bossRollOverviewResponse struct {
	BonusIds string                          `json:"bonus_ids"`
	Items    []bossRollOverviewItem          `json:"items"`
	Rolls    []bossRollOverviewCharacterRoll `json:"rolls"`
}

// currentSeasonBosses returns every boss belonging to the season currently
// marked IsCurrent (empty if there isn't one) — shared by GetRaidRollOverview
// and SearchLootItems, both of which operate over "every boss in the current
// tier" rather than a single team-selected boss.
func currentSeasonBosses() []models.Boss {
	var season models.Season
	if err := database.DB.Where("is_current = ?", true).First(&season).Error; err != nil {
		return []models.Boss{}
	}

	var raids []models.Raid
	database.DB.Where("season_id = ?", season.Id).Find(&raids)
	raidIds := make([]uint, len(raids))
	for i, raid := range raids {
		raidIds[i] = raid.Id
	}

	var bosses []models.Boss
	if len(raidIds) > 0 {
		database.DB.Where("raid_id IN ?", raidIds).Find(&bosses)
	}
	return bosses
}

// computeBossRollStats loads a boss's items (with PrimaryStats/EligibleRoles
// preloaded) and every character's wish/priority/bonus-roll data for
// boss+difficulty, and returns the per-item wisher breakdown alongside the
// per-character roll stats (priority, bonus rolls, pool size, done). Shared
// by GetBossRollOverview (single boss, needs the item-level detail too) and
// GetRaidRollOverview (every boss in the current tier, only needs rolls).
func computeBossRollStats(bossId uint, difficulty string) ([]bossRollOverviewItem, []bossRollOverviewCharacterRoll, error) {
	var items []models.Item
	if err := database.DB.Where("boss_id = ?", bossId).
		Preload("PrimaryStats").
		Preload("EligibleRoles").
		Find(&items).Error; err != nil {
		return nil, nil, fmt.Errorf("fetching boss items: %w", err)
	}
	itemIds := make([]uint, len(items))
	for i, item := range items {
		itemIds[i] = item.ID
	}

	var wishes []models.CharacterItemWish
	if len(itemIds) > 0 {
		database.DB.Where("item_id IN ? AND difficulty = ?", itemIds, difficulty).Find(&wishes)
	}
	wishesByItem := make(map[uint][]itemWisher, len(items))
	rollCharacterIds := make(map[uint]bool)
	doneStatsByCharacter := make(map[uint][2]int) // [0]=total wished, [1]=obtained
	for _, w := range wishes {
		wishesByItem[w.ItemID] = append(wishesByItem[w.ItemID], itemWisher{CharacterID: w.CharacterID, Obtained: w.Obtained})
		rollCharacterIds[w.CharacterID] = true
		stats := doneStatsByCharacter[w.CharacterID]
		stats[0]++
		if w.Obtained {
			stats[1]++
		}
		doneStatsByCharacter[w.CharacterID] = stats
	}

	var priorities []models.CharacterBossPriority
	database.DB.Where("boss_id = ? AND difficulty = ?", bossId, difficulty).Find(&priorities)
	priorityByCharacter := make(map[uint]uint, len(priorities))
	for _, p := range priorities {
		priorityByCharacter[p.CharacterID] = p.Priority
		rollCharacterIds[p.CharacterID] = true
	}

	var bonusRollRows []models.CharacterBossBonusRolls
	database.DB.Where("boss_id = ? AND difficulty = ?", bossId, difficulty).Find(&bonusRollRows)
	bonusRollsByCharacter := make(map[uint]uint, len(bonusRollRows))
	for _, b := range bonusRollRows {
		bonusRollsByCharacter[b.CharacterID] = b.Count
		rollCharacterIds[b.CharacterID] = true
	}

	characterIds := make([]uint, 0, len(rollCharacterIds))
	for characterId := range rollCharacterIds {
		characterIds = append(characterIds, characterId)
	}
	var characters []models.Character
	if len(characterIds) > 0 {
		database.DB.Preload("Specialization.WeaponTypes").Where("id IN ?", characterIds).Find(&characters)
	}
	poolSizeByCharacter := make(map[uint]uint, len(characters))
	for _, char := range characters {
		if char.Specialization == nil {
			continue
		}
		var poolSize uint
		for _, item := range items {
			if item.IsEligibleFor(*char.Specialization) {
				poolSize++
			}
		}
		poolSizeByCharacter[char.ID] = poolSize
	}

	responseItems := []bossRollOverviewItem{}
	for _, item := range items {
		wishers := wishesByItem[item.ID]
		if wishers == nil {
			wishers = []itemWisher{}
		}
		responseItems = append(responseItems, bossRollOverviewItem{
			ID:        item.ID,
			WowItemID: item.WowItemID,
			Name:      item.Name,
			IconUrl:   item.IconUrl,
			Wishers:   wishers,
		})
	}

	responseRolls := []bossRollOverviewCharacterRoll{}
	for characterId := range rollCharacterIds {
		var priority *uint
		if p, ok := priorityByCharacter[characterId]; ok {
			priority = &p
		}
		stats := doneStatsByCharacter[characterId]
		responseRolls = append(responseRolls, bossRollOverviewCharacterRoll{
			CharacterID: characterId,
			Priority:    priority,
			BonusRolls:  bonusRollsByCharacter[characterId],
			PoolSize:    poolSizeByCharacter[characterId],
			Done:        stats[0] > 0 && stats[0] == stats[1],
		})
	}

	return responseItems, responseRolls, nil
}

// GetBossRollOverview returns the whole team's bonus-roll interest in a
// boss+difficulty — every character with a priority, a bonus-roll count, or
// an item wish recorded, plus which items are being wished for and by whom.
// Unlike GetBossLoot (single character, gated by canAccessCharacterWishlist),
// this exposes every character's data at once, so it's loot-council/admin/
// owner only.
func GetBossRollOverview(c *gin.Context) {
	user, ok := getRequestingUser(c)
	if !ok {
		return
	}

	teamId, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	bossId, err := strconv.ParseUint(c.Param("bossId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid boss ID"})
		return
	}

	difficulty, ok := getDifficulty(c, c.Query("difficulty"))
	if !ok {
		return
	}

	if !isLootCouncilOrAdmin(uint(teamId), user.ID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var boss models.Boss
	if err := database.DB.Preload("Raid.Season").First(&boss, bossId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "boss not found"})
		return
	}
	bonusIds := boss.Raid.Season.MythicBonusIds
	if difficulty == models.DifficultyHeroic {
		bonusIds = boss.Raid.Season.HeroicBonusIds
	}

	items, rolls, err := computeBossRollStats(uint(bossId), difficulty)
	if err != nil {
		log.Printf("Error computing boss roll stats: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to compute boss roll stats"})
		return
	}

	response := bossRollOverviewResponse{BonusIds: bonusIds, Items: items, Rolls: rolls}
	c.JSON(http.StatusOK, gin.H{"boss_roll_overview": response})
}

type raidRollOverviewBossEntry struct {
	BossID uint                             `json:"boss_id"`
	Rolls  []bossRollOverviewCharacterRoll `json:"rolls"`
}

type raidRollOverviewResponse struct {
	Bosses []raidRollOverviewBossEntry `json:"bosses"`
}

// GetRaidRollOverview is the Raid-Wide view — the same per-character roll
// stats as GetBossRollOverview, computed for every boss in the current
// season at once. Item-level wisher detail is intentionally omitted (that's
// what Per-Boss is for); this is meant to be scanned as a character × boss
// matrix. Loot-council/admin/owner only, same as GetBossRollOverview.
func GetRaidRollOverview(c *gin.Context) {
	user, ok := getRequestingUser(c)
	if !ok {
		return
	}

	teamId, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	difficulty, ok := getDifficulty(c, c.Query("difficulty"))
	if !ok {
		return
	}

	if !isLootCouncilOrAdmin(uint(teamId), user.ID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	bosses := currentSeasonBosses()

	response := raidRollOverviewResponse{Bosses: []raidRollOverviewBossEntry{}}
	for _, boss := range bosses {
		_, rolls, err := computeBossRollStats(boss.ID, difficulty)
		if err != nil {
			log.Printf("Error computing roll stats for boss %d: %v", boss.ID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to compute raid roll stats"})
			return
		}
		response.Bosses = append(response.Bosses, raidRollOverviewBossEntry{BossID: boss.ID, Rolls: rolls})
	}

	c.JSON(http.StatusOK, gin.H{"raid_roll_overview": response})
}

type lootItemSearchResult struct {
	ItemID    uint   `json:"item_id"`
	WowItemID uint   `json:"wow_item_id"`
	Name      string `json:"name"`
	IconUrl   string `json:"icon_url"`
	BossID    uint   `json:"boss_id"`
	BossName  string `json:"boss_name"`
}

// SearchLootItems searches item names across every boss in the current
// season — used by the Per-Item tab to find an item without navigating the
// boss sidebar first. Loot-council/admin/owner only, same as every other
// aggregate view in this feature.
func SearchLootItems(c *gin.Context) {
	user, ok := getRequestingUser(c)
	if !ok {
		return
	}

	teamId, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	if !isLootCouncilOrAdmin(uint(teamId), user.ID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	results := []lootItemSearchResult{}
	query := strings.TrimSpace(c.Query("q"))
	if query == "" {
		c.JSON(http.StatusOK, gin.H{"items": results})
		return
	}

	bosses := currentSeasonBosses()
	bossIds := make([]uint, len(bosses))
	for i, boss := range bosses {
		bossIds[i] = boss.ID
	}
	if len(bossIds) == 0 {
		c.JSON(http.StatusOK, gin.H{"items": results})
		return
	}

	var items []models.Item
	if err := database.DB.Where("boss_id IN ? AND name ILIKE ?", bossIds, "%"+query+"%").
		Preload("Boss").
		Limit(20).
		Find(&items).Error; err != nil {
		log.Printf("Error searching loot items: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to search items"})
		return
	}

	for _, item := range items {
		results = append(results, lootItemSearchResult{
			ItemID:    item.ID,
			WowItemID: item.WowItemID,
			Name:      item.Name,
			IconUrl:   item.IconUrl,
			BossID:    item.BossID,
			BossName:  item.Boss.Name,
		})
	}

	c.JSON(http.StatusOK, gin.H{"items": results})
}

type itemRollOverviewWisher struct {
	CharacterID uint  `json:"character_id"`
	Obtained    bool  `json:"obtained"`
	Priority    *uint `json:"priority"`
	BonusRolls  uint  `json:"bonus_rolls"`
	// PoolSize is the wisher's eligible-item count for this item's boss
	// (same value shown in Per-Boss's Roll Interest) — gives council a
	// sense of whether this is one of the wisher's only options on this
	// boss or one of several.
	PoolSize uint `json:"pool_size"`
}

type itemRollOverviewResponse struct {
	BonusIds string                    `json:"bonus_ids"`
	Wishers  []itemRollOverviewWisher `json:"wishers"`
}

// GetItemRollOverview is the Per-Item view — for a single item, who's
// wished for it and their standing: priority and bonus rolls are per-boss
// (reused as-is from computeBossRollStats' rolls), obtained is per-item
// (from that same call's item wishers). Loot-council/admin/owner only, same
// as the other aggregate views.
func GetItemRollOverview(c *gin.Context) {
	user, ok := getRequestingUser(c)
	if !ok {
		return
	}

	teamId, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	itemId, err := strconv.ParseUint(c.Param("itemId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item ID"})
		return
	}

	difficulty, ok := getDifficulty(c, c.Query("difficulty"))
	if !ok {
		return
	}

	if !isLootCouncilOrAdmin(uint(teamId), user.ID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var item models.Item
	if err := database.DB.Preload("Boss.Raid.Season").First(&item, itemId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "item not found"})
		return
	}
	bonusIds := item.Boss.Raid.Season.MythicBonusIds
	if difficulty == models.DifficultyHeroic {
		bonusIds = item.Boss.Raid.Season.HeroicBonusIds
	}

	items, rolls, err := computeBossRollStats(item.BossID, difficulty)
	if err != nil {
		log.Printf("Error computing item roll stats: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to compute item roll stats"})
		return
	}

	rollByCharacter := make(map[uint]bossRollOverviewCharacterRoll, len(rolls))
	for _, roll := range rolls {
		rollByCharacter[roll.CharacterID] = roll
	}

	response := itemRollOverviewResponse{BonusIds: bonusIds, Wishers: []itemRollOverviewWisher{}}
	for _, bossItem := range items {
		if bossItem.ID != uint(itemId) {
			continue
		}
		for _, wisher := range bossItem.Wishers {
			roll, hasRoll := rollByCharacter[wisher.CharacterID]
			wisherEntry := itemRollOverviewWisher{CharacterID: wisher.CharacterID, Obtained: wisher.Obtained}
			if hasRoll {
				wisherEntry.Priority = roll.Priority
				wisherEntry.BonusRolls = roll.BonusRolls
				wisherEntry.PoolSize = roll.PoolSize
			}
			response.Wishers = append(response.Wishers, wisherEntry)
		}
		break
	}

	c.JSON(http.StatusOK, gin.H{"item_roll_overview": response})
}

type lootAuditLogResponse struct {
	Entries []models.LootAuditLog `json:"entries"`
	HasMore bool                  `json:"has_more"`
}

// GetLootAuditLog returns the accountability trail for a team's wishlist
// edits — loot-council/admin/owner only. Cursor-paginated via before_id
// (not offset-based, since this table is actively appended to while
// someone might be paging back through it).
func GetLootAuditLog(c *gin.Context) {
	user, ok := getRequestingUser(c)
	if !ok {
		return
	}

	teamId, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	if !isLootCouncilOrAdmin(uint(teamId), user.ID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	limit := 50
	if limitParam := c.Query("limit"); limitParam != "" {
		if parsed, err := strconv.Atoi(limitParam); err == nil && parsed > 0 {
			limit = parsed
		}
	}
	if limit > 100 {
		limit = 100
	}

	query := database.DB.Where("team_id = ?", teamId)
	if beforeId := c.Query("before_id"); beforeId != "" {
		if parsed, err := strconv.ParseUint(beforeId, 10, 32); err == nil {
			query = query.Where("id < ?", parsed)
		}
	}
	if characterId := c.Query("character_id"); characterId != "" {
		if parsed, err := strconv.ParseUint(characterId, 10, 32); err == nil {
			query = query.Where("character_id = ?", parsed)
		}
	}
	if bossId := c.Query("boss_id"); bossId != "" {
		if parsed, err := strconv.ParseUint(bossId, 10, 32); err == nil {
			query = query.Where("boss_id = ?", parsed)
		}
	}

	var entries []models.LootAuditLog
	if err := query.Order("id DESC").Limit(limit).Find(&entries).Error; err != nil {
		log.Printf("Error fetching loot audit log: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch audit log"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"loot_audit_log": lootAuditLogResponse{
		Entries: entries,
		HasMore: len(entries) == limit,
	}})
}

type characterBossPriorityEntry struct {
	BossID   uint `json:"boss_id"`
	Priority uint `json:"priority"`
}

// GetCharacterBossPriorities returns a character's boss priorities for a
// difficulty across every boss in the current tier. One response feeds
// three UI pieces: the boss sidebar's priority badges, the invalid-sequence
// check, and the fix-priorities modal's initial ordering.
func GetCharacterBossPriorities(c *gin.Context) {
	user, ok := getRequestingUser(c)
	if !ok {
		return
	}

	teamId, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	characterId, err := strconv.ParseUint(c.Param("characterId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid character ID"})
		return
	}

	difficulty, ok := getDifficulty(c, c.Query("difficulty"))
	if !ok {
		return
	}

	if !canAccessCharacterWishlist(uint(teamId), user.ID, uint(characterId)) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	bosses := currentSeasonBosses()
	bossIds := make([]uint, len(bosses))
	for i, boss := range bosses {
		bossIds[i] = boss.ID
	}

	entries := []characterBossPriorityEntry{}
	if len(bossIds) > 0 {
		var priorities []models.CharacterBossPriority
		database.DB.Where("character_id = ? AND difficulty = ? AND boss_id IN ?", characterId, difficulty, bossIds).Find(&priorities)
		for _, p := range priorities {
			entries = append(entries, characterBossPriorityEntry{BossID: p.BossID, Priority: p.Priority})
		}
	}

	c.JSON(http.StatusOK, gin.H{"priorities": entries})
}

type reorderBossPrioritiesPayload struct {
	Difficulty string `json:"difficulty"`
	BossIDs    []uint `json:"boss_ids"`
}

// ReorderBossPriorities replaces a character's entire priority ordering for
// a difficulty in one shot — delete existing rows, recreate from the given
// order (index 0 -> priority 1). Used by the drag-reorder fix-it modal and
// the "done with this boss" auto-shift, both of which need to move
// priorities "through" each other's current values, which the single-boss
// UpsertBossPriority endpoint intentionally rejects.
func ReorderBossPriorities(c *gin.Context) {
	user, ok := getRequestingUser(c)
	if !ok {
		return
	}

	teamId, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	characterId, err := strconv.ParseUint(c.Param("characterId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid character ID"})
		return
	}

	var payload reorderBossPrioritiesPayload
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	difficulty, ok := getDifficulty(c, payload.Difficulty)
	if !ok {
		return
	}

	if !canAccessCharacterWishlist(uint(teamId), user.ID, uint(characterId)) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var existing []models.CharacterBossPriority
	database.DB.Where("character_id = ? AND difficulty = ?", characterId, difficulty).Find(&existing)
	previousPriorityByBoss := make(map[uint]uint, len(existing))
	for _, p := range existing {
		previousPriorityByBoss[p.BossID] = p.Priority
	}

	err = database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("character_id = ? AND difficulty = ?", characterId, difficulty).
			Delete(&models.CharacterBossPriority{}).Error; err != nil {
			return err
		}
		for i, bossId := range payload.BossIDs {
			if err := tx.Create(&models.CharacterBossPriority{
				CharacterID: uint(characterId),
				BossID:      bossId,
				Difficulty:  difficulty,
				Priority:    uint(i + 1),
			}).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to reorder priorities"})
		return
	}

	for i, bossId := range payload.BossIDs {
		newPriority := uint(i + 1)
		if previousPriorityByBoss[bossId] == newPriority {
			continue
		}
		if boss, character, ok := loadBossAuditContext(bossId, uint(characterId)); ok {
			value := newPriority
			recordAuditLog(models.LootAuditLog{
				TeamID:         uint(teamId),
				EventType:      models.AuditEventPrioritySet,
				ActingUserID:   user.ID,
				ActingUserBTag: user.BTag,
				CharacterID:    uint(characterId),
				CharacterName:  character.Name,
				BossID:         bossId,
				BossName:       boss.Name,
				Difficulty:     difficulty,
				Value:          &value,
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}
