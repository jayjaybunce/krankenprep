package handlers

import (
	"krankenprep/database"
	"krankenprep/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var validTierSlots = map[string]bool{
	models.TierSlotHead:     true,
	models.TierSlotShoulder: true,
	models.TierSlotChest:    true,
	models.TierSlotLegs:     true,
	models.TierSlotGloves:   true,
}

var validTierSources = map[string]bool{
	models.TierSourceNone:            true,
	models.TierSourceChampion:        true,
	models.TierSourceVeteran:         true,
	models.TierSourceHero:            true,
	models.TierSourceMyth:            true,
	models.TierSourceEmbellishment:   true,
	models.TierSourceInVaultChampion: true,
	models.TierSourceInVaultHero:     true,
	models.TierSourceInVaultMyth:     true,
}

type tierSlotEntry struct {
	CharacterID uint   `json:"character_id"`
	Slot        string `json:"slot"`
	Source      string `json:"source"`
}

// GetTeamTierSlots returns every tier-slot entry set for any character on
// the team — the frontend already has character name/specialization from
// useGetTeamById, so this only needs to carry the character_id -> slot ->
// source data itself.
func GetTeamTierSlots(c *gin.Context) {
	user, ok := getRequestingUser(c)
	if !ok {
		return
	}

	teamId, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	if !isTeamMember(uint(teamId), user.ID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var players []models.Player
	database.DB.Where("team_id = ?", teamId).Find(&players)
	playerIds := make([]uint, len(players))
	for i, p := range players {
		playerIds[i] = p.ID
	}

	var characters []models.Character
	if len(playerIds) > 0 {
		database.DB.Where("player_id IN ?", playerIds).Find(&characters)
	}
	characterIds := make([]uint, len(characters))
	for i, ch := range characters {
		characterIds[i] = ch.ID
	}

	entries := []tierSlotEntry{}
	if len(characterIds) > 0 {
		var slots []models.CharacterTierSlot
		database.DB.Where("character_id IN ?", characterIds).Find(&slots)
		for _, s := range slots {
			entries = append(entries, tierSlotEntry{CharacterID: s.CharacterID, Slot: s.Slot, Source: s.Source})
		}
	}

	c.JSON(http.StatusOK, gin.H{"tier_slots": entries})
}

type tierSlotPayload struct {
	Slot   string `json:"slot"`
	Source string `json:"source"`
}

// UpsertCharacterTierSlot sets a character's current tier-slot status — a
// snapshot overwritten in place, no history kept.
func UpsertCharacterTierSlot(c *gin.Context) {
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

	var payload tierSlotPayload
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	if !validTierSlots[payload.Slot] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tier slot"})
		return
	}
	if !validTierSources[payload.Source] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tier source"})
		return
	}

	if !canAccessCharacterWishlist(uint(teamId), user.ID, uint(characterId)) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var tierSlot models.CharacterTierSlot
	result := database.DB.Where("character_id = ? AND slot = ?", characterId, payload.Slot).First(&tierSlot)
	if result.Error != nil {
		if result.Error != gorm.ErrRecordNotFound {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to query tier slot"})
			return
		}
		tierSlot = models.CharacterTierSlot{
			CharacterID: uint(characterId),
			Slot:        payload.Slot,
			Source:      payload.Source,
		}
		if err := database.DB.Create(&tierSlot).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save tier slot"})
			return
		}
	} else {
		tierSlot.Source = payload.Source
		if err := database.DB.Save(&tierSlot).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save tier slot"})
			return
		}
	}

	c.JSON(http.StatusOK, tierSlot)
}

// GetTierSimData returns the current season's community tier-sim benefit
// data, joined with each entry's Specialization/Class/ArmorType for grouping
// and coloring client-side, plus a last_updated timestamp (the newest
// UpdatedAt among the returned rows) so the UI can show how fresh the data
// is. This dataset is read-only from the app's side — populated by hand
// directly in the database, no import endpoint exists.
func GetTierSimData(c *gin.Context) {
	user, ok := getRequestingUser(c)
	if !ok {
		return
	}

	teamId, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	if !isTeamMember(uint(teamId), user.ID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var season models.Season
	if err := database.DB.Where("is_current = ?", true).First(&season).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"tier_sim_entries": []models.TierSimEntry{}, "last_updated": nil})
		return
	}

	var entries []models.TierSimEntry
	database.DB.Where("season_id = ?", season.Id).
		Preload("Specialization.Class").
		Preload("Specialization.ArmorType").
		Find(&entries)

	var lastUpdated *time.Time
	for _, e := range entries {
		if lastUpdated == nil || e.UpdatedAt.After(*lastUpdated) {
			u := e.UpdatedAt
			lastUpdated = &u
		}
	}

	c.JSON(http.StatusOK, gin.H{"tier_sim_entries": entries, "last_updated": lastUpdated})
}
