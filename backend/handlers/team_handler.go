package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"krankenprep/database"
	"krankenprep/models"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/net/html"
	"gorm.io/gorm"
)

type CreatTeamPayload struct {
	Name                string `json:"name"`
	RioUrl              string `json:"rio_url"`
	Server              string `json:"server"`
	Region              string `json:"region"`
	WowAuditIntegration bool   `json:"wowaudit_integration"`
	WowAuditUrl         string `json:"wowaudit_url"`
	WowAuditApiKey      string `json:"wowaudit_api_key"`
}

func CreateTeam(c *gin.Context) {
	val, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User context is broken"})
		return
	}
	ctx := context.Background()
	user, ok := val.(*models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user type"})
		return
	}

	// Create Team
	var createTeamPayload CreatTeamPayload

	if err := c.BindJSON(&createTeamPayload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}
	log.Print("Attempting to create team with data")
	log.Print(createTeamPayload)

	team := models.Team{Name: createTeamPayload.Name, RioUrl: createTeamPayload.RioUrl, Region: createTeamPayload.Region, Server: createTeamPayload.Server, WowAuditIntegration: createTeamPayload.WowAuditIntegration, WowAuditUrl: createTeamPayload.WowAuditUrl, WowAuditApiKey: createTeamPayload.WowAuditApiKey}
	result := gorm.WithResult()
	err := gorm.G[models.Team](database.DB, result).Create(ctx, &team)
	if err != nil {
		log.Printf("creating new team: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create team"})
		return
	}
	log.Printf("Team created with id: %v", team.ID)
	// Create Role
	role := models.Role{Name: "owner", TeamID: team.ID, UserID: user.ID}
	result = gorm.WithResult()
	role_err := gorm.G[models.Role](database.DB, result).Create(ctx, &role)
	if role_err != nil {
		log.Printf("creating new role: %v", role_err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create owner role"})
		return
	}
	log.Printf("SUCCESS: Created team with id %v and role with id %v", team.ID, role.ID)

	// // Reload team with roles to include in response
	// database.DB.Preload("Roles").First(&team, team.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Team created successfully",
		"team":    team,
	})
}

type TestWowAuditPayload struct {
	ApiKey string `json:"api_key"`
}

func TestWowAuditIntegration(c *gin.Context) {
	var payload TestWowAuditPayload
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	req, err := http.NewRequest("GET", "https://wowaudit.com/v1/team", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to build request"})
		return
	}
	req.Header.Set("Authorization", payload.ApiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to reach WowAudit"})
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to read WowAudit response"})
		return
	}

	var wowAuditData map[string]any
	if err := json.Unmarshal(body, &wowAuditData); err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Invalid response from WowAudit"})
		return
	}

	c.JSON(resp.StatusCode, wowAuditData)
}

func GetTeamBosses(c *gin.Context) {
	val, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User context is broken"})
		return
	}
	user, _ := val.(*models.User)
	log.Printf("Got user with id: %v", user.ID)
	teamId := c.Query("id")
	if teamId == "" {
		log.Printf("finding boss data for team failed")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "missing team id in request"})
	}
	bosses := []models.Boss{}
	database.DB.Preload("Phases", "team_id = ?", teamId).
		Preload("Phases.Sections").
		Preload("Phases.Sections.Contents").
		Where("bosses.current = ?", true).
		Order("bosses.order ASC").
		Find(&bosses)

	c.JSON(http.StatusOK, bosses)
	// Get bosses first
	// Preload phases
	// Preload section
	// Preload section content

}

func GetTeamById(c *gin.Context) {
	val, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User context is broken"})
		return
	}
	teamIdParam := c.Param("teamId")
	if teamIdParam == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "missing team id parameter"})
		return
	}

	teamId, err := strconv.ParseUint(teamIdParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid team id"})
		return
	}
	user, _ := val.(*models.User)
	role := models.Role{}
	if err := database.DB.Where("team_id = ? AND user_id = ? AND name IN ?", teamId, user.ID, []string{"owner", "admin"}).First(&role).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user unauthorized for team"})
		return
	}
	team := models.Team{}
	if err := database.DB.Preload("WishlistConfigs").Preload("InviteLinks").Preload("Roles").Preload("Roles.User").Where("id = ?", teamId).Find(&team).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "team not found"})
		return
	}
	c.JSON(http.StatusOK, team)

}

func DeleteMemberFromTeam(c *gin.Context) {
	val, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User context is broken"})
		return
	}
	user, ok := val.(*models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "requesting user not found"})
		return
	}
	teamIdParam := c.Param("teamId")
	if teamIdParam == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing team Id param"})
		return
	}
	roleIdParam := c.Param("roleId")
	if roleIdParam == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing member id"})
		return
	}
	teamId, err := strconv.ParseUint(teamIdParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid team id"})
		return
	}
	roleId, err := strconv.ParseUint(roleIdParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid member id"})
		return
	}
	userAdminRole := models.Role{}
	if err := database.DB.Where("team_id = ? AND user_id = ? AND name IN ?", teamId, user.ID, []string{"owner", "admin"}).First(&userAdminRole).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Fetch the role to be deleted to check if it's an owner
	memberRole := models.Role{}
	if err := database.DB.Where("team_id = ? AND id = ?", teamId, roleId).First(&memberRole).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "member not found"})
		return
	}

	// Prevent admins from removing owners
	if userAdminRole.Name == "admin" && memberRole.Name == "owner" {
		c.JSON(http.StatusForbidden, gin.H{"error": "admins cannot remove owners from the team"})
		return
	}

	if err := database.DB.Delete(&memberRole).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to remove member"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "member removed from team"})

}

// WoWAudit JSON shapes

type wowAuditWishlistConfig struct {
	ID                     uint   `json:"id"`
	Name                   string `json:"name"`
	Description            string `json:"description"`
	FightStyle             string `json:"fight_style"`
	NumberOfBosses         uint   `json:"number_of_bosses"`
	FightDuration          uint   `json:"fight_duration"`
	Sockets                bool   `json:"sockets"`
	Pi                     bool   `json:"pi"`
	ExpertMode             bool   `json:"expert_mode"`
	MatchEquippedGear      bool   `json:"match_equipped_gear"`
	UpgradeLevel           uint   `json:"upgrade_level"`
	UpgradeLevelMythic     uint   `json:"upgrade_level_mythic"`
	UpgradeLevelHeroic     uint   `json:"upgrade_level_heroic"`
	UpgradeLevelNormal     uint   `json:"upgrade_level_normal"`
	UpgradeLevelLfr        uint   `json:"upgrade_level_lfr"`
	UpgradeLevelRaidFinder uint   `json:"upgrade_level_raid_finder"`
}

type wowAuditGuildData struct {
	Guild struct {
		SelectedTeam struct {
			WishlistConfigurations []wowAuditWishlistConfig `json:"wishlist_configurations"`
		} `json:"selectedTeam"`
	} `json:"guild"`
}

// extractGuildDataSlot walks the parsed HTML tree and returns the value of the
// `data` attribute on the <slot id="guild-data"> element.
func extractGuildDataSlot(body io.Reader) (string, error) {
	doc, err := html.Parse(body)
	if err != nil {
		return "", err
	}

	var result string
	var traverse func(*html.Node)
	traverse = func(n *html.Node) {
		if result != "" {
			return
		}
		if n.Type == html.ElementNode && n.Data == "slot" {
			isGuildData := false
			for _, attr := range n.Attr {
				if attr.Key == "id" && attr.Val == "guild-data" {
					isGuildData = true
					break
				}
			}
			if isGuildData {
				for _, attr := range n.Attr {
					if attr.Key == "data" {
						result = attr.Val
						return
					}
				}
			}
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			traverse(c)
		}
	}
	traverse(doc)
	return result, nil
}

func SyncWowAuditWishlists(c *gin.Context) {
	val, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User context is broken"})
		return
	}
	user, ok := val.(*models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user type"})
		return
	}

	teamIdParam := c.Param("teamId")
	teamId, err := strconv.ParseUint(teamIdParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid team id"})
		return
	}

	// Validate the requesting user has owner or loot_council role on this team
	role := models.Role{}
	if err := database.DB.Where("team_id = ? AND user_id = ? AND name IN ?", teamId, user.ID, []string{"owner", "loot_council"}).First(&role).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: must be owner or loot council"})
		return
	}

	// Fetch team to get WowAuditUrl
	team := models.Team{}
	if err := database.DB.First(&team, teamId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "team not found"})
		return
	}
	if team.WowAuditUrl == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "team has no WoWAudit URL configured"})
		return
	}

	// Fetch the WoWAudit guild page
	resp, err := http.Get(team.WowAuditUrl)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to reach WoWAudit"})
		return
	}
	defer resp.Body.Close()

	// Extract the guild-data slot JSON from HTML
	guildDataJSON, err := extractGuildDataSlot(resp.Body)
	if err != nil || guildDataJSON == "" {
		log.Printf("failed to extract guild-data slot: %v", err)
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to parse WoWAudit response"})
		return
	}

	// Unmarshal the JSON payload
	var guildData wowAuditGuildData
	if err := json.Unmarshal([]byte(guildDataJSON), &guildData); err != nil {
		log.Printf("failed to decode WoWAudit guild data: %v", err)
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to decode WoWAudit data"})
		return
	}

	// Upsert each wishlist configuration by WowAuditID
	for _, cfg := range guildData.Guild.SelectedTeam.WishlistConfigurations {
		wishlist := models.Wishlist{}
		existing := database.DB.Where("team_id = ? AND wow_audit_id = ?", teamId, cfg.ID).First(&wishlist)

		wishlist.WowAuditID = cfg.ID
		wishlist.TeamID = uint(teamId)
		wishlist.Name = cfg.Name
		wishlist.Description = cfg.Description
		wishlist.FightStyle = cfg.FightStyle
		wishlist.NumberOfBosses = cfg.NumberOfBosses
		wishlist.FightDuration = cfg.FightDuration
		wishlist.Sockets = cfg.Sockets
		wishlist.Pi = cfg.Pi
		wishlist.ExpertMode = cfg.ExpertMode
		wishlist.MatchEquippedGear = cfg.MatchEquippedGear
		wishlist.UpgradeLevel = cfg.UpgradeLevel
		wishlist.UpgradeLevelMythic = cfg.UpgradeLevelMythic
		wishlist.UpgradeLevelHeroic = cfg.UpgradeLevelHeroic
		wishlist.UpgradeLevelNormal = cfg.UpgradeLevelNormal
		wishlist.UpgradeLevelLfr = cfg.UpgradeLevelLfr
		wishlist.UpgradeLevelRaidFinder = cfg.UpgradeLevelRaidFinder

		if existing.Error != nil {
			if err := database.DB.Create(&wishlist).Error; err != nil {
				log.Printf("failed to create wishlist config %v: %v", cfg.ID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save wishlist config"})
				return
			}
		} else {
			if err := database.DB.Save(&wishlist).Error; err != nil {
				log.Printf("failed to update wishlist config %v: %v", cfg.ID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save wishlist config"})
				return
			}
		}
	}

	team.WoWAuditDataSyncDate = time.Now()
	database.DB.Save(team)

	c.JSON(http.StatusOK, gin.H{"message": "wishlist configurations synced"})
}

// UploadDroptimizerPayload is the request body for POST /teams/:teamId/wowaudit/upload
type UploadDroptimizerPayload struct {
	WishlistID uint   `json:"wishlist_id" binding:"required"`
	URL        string `json:"url" binding:"required"`
}

// parsedDroptimizerMeta holds the fields extracted from a Raidbots droptimizer report
type parsedDroptimizerMeta struct {
	Character       string
	Spec            string
	SimType         string
	FightStyle      string
	FightLength     float64
	PowerInfusion   bool
	UpgradeEquipped bool
	Difficulty      string
	UpgradeLevel    string
}

// difficultyUpgradeTrack maps a Raidbots difficulty label to its upgrade track name and max tier,
// so we can construct the expected label (e.g. "Myth 6/6") from the wishlist's numeric tier value.
type difficultyUpgradeTrack struct {
	track   string
	maxTier uint
}

var raidbotsUpgradeTracks = map[string]difficultyUpgradeTrack{
	"Mythic": {track: "Myth", maxTier: 6},
	"Heroic": {track: "Hero", maxTier: 6},
	"Normal": {track: "Champion", maxTier: 8},
	"LFR":    {track: "Veteran", maxTier: 8},
}

// requiredBuffs lists standard raid buffs that must always be active in the sim.
// Key matches the field name in simbot.meta of the Raidbots JSON.
var requiredBuffs = map[string]string{
	"bloodlust":       "Bloodlust must be active in sim",
	"arcaneIntellect": "Arcane Intellect must be active in sim",
	"fortitude":       "Fortitude must be active in sim",
	"battleShout":     "Battle Shout must be active in sim",
	"mysticTouch":     "Mystic Touch must be active in sim",
	"chaosBrand":      "Chaos Brand must be active in sim",
	"skyfury":         "Skyfury Totem must be active in sim",
	"markOfTheWild":   "Mark of the Wild must be active in sim",
	"huntersMark":     "Hunter's Mark must be active in sim",
}

var raidbotsReportURLRegex = regexp.MustCompile(`^https://www\.raidbots\.com/simbot/report/([a-zA-Z0-9]+)$`)

// parseDroptimizerURL validates a Raidbots report URL and returns (valid, reportID).
func parseDroptimizerURL(url string) (bool, string) {
	match := raidbotsReportURLRegex.FindStringSubmatch(url)
	if match == nil {
		return false, ""
	}
	return true, match[1]
}

// getNestedString safely walks a map[string]interface{} chain and returns the string value.
func getNestedString(data map[string]interface{}, keys ...string) string {
	var cur interface{} = data
	for _, k := range keys {
		m, ok := cur.(map[string]interface{})
		if !ok {
			return ""
		}
		cur = m[k]
	}
	s, _ := cur.(string)
	return s
}

// getNestedBool safely walks a map[string]interface{} chain and returns the bool value.
func getNestedBool(data map[string]interface{}, keys ...string) bool {
	var cur interface{} = data
	for _, k := range keys {
		m, ok := cur.(map[string]interface{})
		if !ok {
			return false
		}
		cur = m[k]
	}
	b, _ := cur.(bool)
	return b
}

// getNestedFloat safely walks a map[string]interface{} chain and returns the float64 value.
func getNestedFloat(data map[string]interface{}, keys ...string) float64 {
	var cur interface{} = data
	for _, k := range keys {
		m, ok := cur.(map[string]interface{})
		if !ok {
			return 0
		}
		cur = m[k]
	}
	f, _ := cur.(float64)
	return f
}

// fetchRaidbotsReportData fetches the raw JSON data for a Raidbots report.
func fetchRaidbotsReportData(reportID string) (map[string]interface{}, error) {
	url := fmt.Sprintf("https://www.raidbots.com/simbot/report/%s/data.json", reportID)
	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("fetching raidbots report: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("raidbots returned status %d", resp.StatusCode)
	}
	var data map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, fmt.Errorf("decoding raidbots report: %w", err)
	}
	return data, nil
}

// parseRaidbotsTitle splits a title like "Source • Instance • Difficulty • UpgradeLevel"
// and returns the difficulty and upgrade level components.
func parseRaidbotsTitle(title string) (difficulty, upgradeLevel string) {
	parts := strings.Split(title, "•")
	switch len(parts) {
	case 4:
		difficulty = strings.TrimSpace(parts[2])
		upgradeLevel = strings.TrimSpace(parts[3])
	case 3:
		difficulty = strings.TrimSpace(parts[2])
	}
	return
}

// parseRaidbotsDroptimizerData extracts the fields we need to validate from raw report JSON.
func parseRaidbotsDroptimizerData(data map[string]interface{}) (*parsedDroptimizerMeta, error) {
	meta := &parsedDroptimizerMeta{
		Character:       getNestedString(data, "simbot", "player"),
		Spec:            getNestedString(data, "simbot", "spec"),
		SimType:         getNestedString(data, "simbot", "meta", "type"),
		FightStyle:      getNestedString(data, "simbot", "meta", "fightStyle"),
		FightLength:     getNestedFloat(data, "simbot", "meta", "fightLength"),
		PowerInfusion:   getNestedBool(data, "simbot", "meta", "powerInfusion"),
		UpgradeEquipped: getNestedBool(data, "simbot", "meta", "rawFormData", "droptimizer", "upgradeEquipped"),
	}
	title := getNestedString(data, "simbot", "meta", "title")
	meta.Difficulty, meta.UpgradeLevel = parseRaidbotsTitle(title)

	if meta.Character == "" {
		return nil, fmt.Errorf("character name missing from report")
	}
	return meta, nil
}

// validateReportAgainstWishlist checks the parsed report metadata against the team's wishlist config.
// All validation errors are collected and returned together.
func validateReportAgainstWishlist(meta *parsedDroptimizerMeta, wishlist models.Wishlist) []string {
	var errs []string

	if meta.SimType != "droptimizer" {
		errs = append(errs, "simulation type must be droptimizer")
	}
	if meta.FightStyle != wishlist.FightStyle {
		errs = append(errs, fmt.Sprintf("fight style must be '%s' (got '%s')", wishlist.FightStyle, meta.FightStyle))
	}
	if uint(meta.FightLength) != wishlist.FightDuration {
		errs = append(errs, fmt.Sprintf("fight length must be %d seconds (got %.0f)", wishlist.FightDuration, meta.FightLength))
	}
	if meta.UpgradeEquipped != wishlist.MatchEquippedGear {
		if wishlist.MatchEquippedGear {
			errs = append(errs, "please enable 'Upgrade All Equipped Gear to the Same Level' in droptimizer settings")
		} else {
			errs = append(errs, "please disable 'Upgrade All Equipped Gear to the Same Level' in droptimizer settings")
		}
	}
	if meta.PowerInfusion != wishlist.Pi {
		if wishlist.Pi {
			errs = append(errs, "Power Infusion must be active in sim")
		} else {
			errs = append(errs, "Power Infusion must not be active in sim")
		}
	}

	// Validate upgrade level by mapping difficulty → wishlist tier → expected Raidbots label.
	// The wishlist stores the expected tier number (e.g. 6 for "Myth 6/6").
	if meta.Difficulty != "" && meta.UpgradeLevel != "" {
		if track, ok := raidbotsUpgradeTracks[meta.Difficulty]; ok {
			var expectedTier uint
			switch meta.Difficulty {
			case "Mythic":
				expectedTier = wishlist.UpgradeLevelMythic
			case "Heroic":
				expectedTier = wishlist.UpgradeLevelHeroic
			case "Normal":
				expectedTier = wishlist.UpgradeLevelNormal
			case "LFR":
				expectedTier = wishlist.UpgradeLevelLfr
			}
			if expectedTier > 0 {
				expectedLabel := fmt.Sprintf("%s %d/%d", track.track, expectedTier, track.maxTier)
				if meta.UpgradeLevel != expectedLabel {
					errs = append(errs, fmt.Sprintf("upgrade level for %s must be '%s' (got '%s')", meta.Difficulty, expectedLabel, meta.UpgradeLevel))
				}
			}
		}
	}

	return errs
}

// getWoWAuditCharacterByName fetches the team's roster from WoWAudit and returns the matching character.
func getWoWAuditCharacterByName(name, apiKey string) (map[string]interface{}, error) {
	req, err := http.NewRequest("GET", "https://wowaudit.com/v1/characters", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", apiKey)

	resp, err := (&http.Client{}).Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("WoWAudit roster request failed with status %d", resp.StatusCode)
	}

	var roster []map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&roster); err != nil {
		return nil, err
	}

	nameLower := strings.ToLower(name)
	for _, char := range roster {
		if charName, ok := char["name"].(string); ok && strings.ToLower(charName) == nameLower {
			return char, nil
		}
	}
	return nil, nil
}

// uploadDroptimizerToWoWAudit posts the droptimizer report to the WoWAudit wishlist API.
func uploadDroptimizerToWoWAudit(characterName string, characterID float64, reportID, configurationName, apiKey string) (bool, error) {
	payload := map[string]interface{}{
		"character_name":       characterName,
		"character_id":         int(characterID),
		"report_id":            reportID,
		"configuration_name":   configurationName,
		"replace_manual_edits": true,
		"clear_conduits":       true,
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return false, err
	}

	req, err := http.NewRequest("POST", "https://wowaudit.com/v1/wishlists", bytes.NewReader(body))
	if err != nil {
		return false, err
	}
	req.Header.Set("Authorization", apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := (&http.Client{}).Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()
	return resp.StatusCode == http.StatusOK, nil
}

// UploadDroptimizer handles POST /teams/:teamId/wowaudit/upload.
// It validates the report URL, the report settings against the team's wishlist config,
// confirms the character is in the WoWAudit roster, then uploads the droptimizer.
func UploadDroptimizer(c *gin.Context) {
	val, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User context is broken"})
		return
	}
	user, ok := val.(*models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user type"})
		return
	}

	teamIdParam := c.Param("teamId")
	teamId, err := strconv.ParseUint(teamIdParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid team id"})
		return
	}

	var payload UploadDroptimizerPayload
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request payload"})
		return
	}

	// Confirm the requesting user belongs to this team
	userRole := models.Role{}
	if err := database.DB.Where("team_id = ? AND user_id = ?", teamId, user.ID).First(&userRole).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user is not a member of this team"})
		return
	}

	// Fetch team to check WoWAudit is configured and get the API key
	team := models.Team{}
	if err := database.DB.First(&team, teamId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "team not found"})
		return
	}
	if !team.WowAuditIntegration || team.WowAuditApiKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "WoWAudit integration is not configured for this team"})
		return
	}

	// Fetch the wishlist config and confirm it belongs to this team
	wishlist := models.Wishlist{}
	if err := database.DB.Where("id = ? AND team_id = ?", payload.WishlistID, teamId).First(&wishlist).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "wishlist configuration not found for this team"})
		return
	}

	// Validate URL and extract the Raidbots report ID
	valid, reportID := parseDroptimizerURL(payload.URL)
	if !valid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid URL: must be a Raidbots droptimizer report (https://www.raidbots.com/simbot/report/...)"})
		return
	}

	// Fetch report JSON from Raidbots
	reportData, err := fetchRaidbotsReportData(reportID)
	if err != nil {
		log.Printf("failed to fetch raidbots report %s: %v", reportID, err)
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to fetch report from Raidbots"})
		return
	}

	// Parse the fields we need
	meta, err := parseRaidbotsDroptimizerData(reportData)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("failed to parse report: %v", err)})
		return
	}

	// Collect all validation errors before responding
	var validationErrors []string

	// Standard raid buffs – always required to be true
	simMeta, _ := reportData["simbot"].(map[string]interface{})["meta"].(map[string]interface{})
	for buffKey, errMsg := range requiredBuffs {
		buffVal, _ := simMeta[buffKey].(bool)
		if !buffVal {
			validationErrors = append(validationErrors, errMsg)
		}
	}

	// Wishlist-driven validations (fight style, duration, upgrade level, PI, equipped gear)
	validationErrors = append(validationErrors, validateReportAgainstWishlist(meta, wishlist)...)

	if len(validationErrors) > 0 {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"error":   "report validation failed",
			"details": validationErrors,
		})
		return
	}

	// Confirm the character exists in the WoWAudit roster
	character, err := getWoWAuditCharacterByName(meta.Character, team.WowAuditApiKey)
	if err != nil {
		log.Printf("failed to fetch WoWAudit roster: %v", err)
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to reach WoWAudit roster"})
		return
	}
	if character == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("character '%s' not found in WoWAudit roster", meta.Character)})
		return
	}

	characterID, ok := character["id"].(float64)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "unexpected character ID format from WoWAudit"})
		return
	}

	// Upload the droptimizer to WoWAudit using the wishlist's name as the configuration name
	success, err := uploadDroptimizerToWoWAudit(meta.Character, characterID, reportID, wishlist.Name, team.WowAuditApiKey)
	if err != nil {
		log.Printf("WoWAudit upload error for report %s: %v", reportID, err)
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to upload report to WoWAudit"})
		return
	}
	if !success {
		c.JSON(http.StatusBadGateway, gin.H{"error": "WoWAudit rejected the upload"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "droptimizer uploaded successfully",
		"character": meta.Character,
		"spec":      meta.Spec,
		"difficulty": meta.Difficulty,
	})
}
