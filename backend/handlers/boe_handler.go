package handlers

import (
	"krankenprep/database"
	"krankenprep/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var validBoeSlots = map[string]bool{
	models.BoeSlotHead:     true,
	models.BoeSlotNeck:     true,
	models.BoeSlotShoulder: true,
	models.BoeSlotBack:     true,
	models.BoeSlotChest:    true,
	models.BoeSlotWrist:    true,
	models.BoeSlotHands:    true,
	models.BoeSlotWaist:    true,
	models.BoeSlotLegs:     true,
	models.BoeSlotFeet:     true,
	models.BoeSlotFinger:   true,
	models.BoeSlotTrinket:  true,
	models.BoeSlotWeapon:   true,
	models.BoeSlotOffHand:  true,
}

// boeSaleResponse embeds the model plus explicit GuildCut/PlayerCut fields —
// the only place these numbers are ever computed, per BoeSale.GuildCut/
// PlayerCut.
type boeSaleResponse struct {
	models.BoeSale
	GuildCut  float64 `json:"guild_cut"`
	PlayerCut float64 `json:"player_cut"`
}

func toBoeSaleResponse(sale models.BoeSale) boeSaleResponse {
	return boeSaleResponse{
		BoeSale:   sale,
		GuildCut:  sale.GuildCut(),
		PlayerCut: sale.PlayerCut(),
	}
}

type boeTotals struct {
	SalePrice float64 `json:"sale_price"`
	GuildCut  float64 `json:"guild_cut"`
	PlayerCut float64 `json:"player_cut"`
}

// currentSeasonID returns the ID of whichever Season is currently marked
// IsCurrent, and ok=false if none is set.
func currentSeasonID() (uint, bool) {
	var season models.Season
	if err := database.DB.Where("is_current = ?", true).First(&season).Error; err != nil {
		return 0, false
	}
	return season.Id, true
}

// GetBoeSales returns every BoE sale for the team in the given (or current)
// season, plus totals computed over that same set — server-side, so the
// frontend never has to re-derive them independently.
func GetBoeSales(c *gin.Context) {
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

	var seasonId uint
	if q := c.Query("season_id"); q != "" {
		parsed, err := strconv.ParseUint(q, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid season ID"})
			return
		}
		seasonId = uint(parsed)
	} else {
		id, ok := currentSeasonID()
		if !ok {
			c.JSON(http.StatusOK, gin.H{"sales": []boeSaleResponse{}, "totals": boeTotals{}})
			return
		}
		seasonId = id
	}

	var sales []models.BoeSale
	database.DB.Where("team_id = ? AND season_id = ?", teamId, seasonId).
		Order("created_at desc").
		Find(&sales)

	responses := make([]boeSaleResponse, len(sales))
	totals := boeTotals{}
	for i, sale := range sales {
		resp := toBoeSaleResponse(sale)
		responses[i] = resp
		totals.SalePrice += sale.SalePrice
		totals.GuildCut += resp.GuildCut
		totals.PlayerCut += resp.PlayerCut
	}

	c.JSON(http.StatusOK, gin.H{"sales": responses, "totals": totals})
}

type boeSalePayload struct {
	PlayerName   string  `json:"player_name"`
	ItemName     string  `json:"item_name"`
	ItemSlot     string  `json:"item_slot"`
	SalePrice    float64 `json:"sale_price"`
	SoldToPlayer bool    `json:"sold_to_player"`
}

// CreateBoeSale stamps the record with whichever season is currently
// IsCurrent — that stays fixed even after the season rolls over, which is
// what makes season-to-season comparison meaningful.
func CreateBoeSale(c *gin.Context) {
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

	var payload boeSalePayload
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	if !validBoeSlots[payload.ItemSlot] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid item slot"})
		return
	}

	seasonId, ok := currentSeasonID()
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no current season set"})
		return
	}

	sale := models.BoeSale{
		TeamID:          uint(teamId),
		SeasonID:        seasonId,
		PlayerName:      payload.PlayerName,
		ItemName:        payload.ItemName,
		ItemSlot:        payload.ItemSlot,
		SalePrice:       payload.SalePrice,
		SoldToPlayer:    payload.SoldToPlayer,
		CreatedByUserID: user.ID,
	}
	if err := database.DB.Create(&sale).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save BoE sale"})
		return
	}

	c.JSON(http.StatusOK, toBoeSaleResponse(sale))
}

// UpdateBoeSale edits only the record's fields — SeasonID is intentionally
// never touched here, so fixing a typo doesn't retroactively move the sale
// into whatever season happens to be current at edit time.
func UpdateBoeSale(c *gin.Context) {
	user, ok := getRequestingUser(c)
	if !ok {
		return
	}

	teamId, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	boeSaleId, err := strconv.ParseUint(c.Param("boeSaleId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid BoE sale ID"})
		return
	}

	if !isLootCouncilOrAdmin(uint(teamId), user.ID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var payload boeSalePayload
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	if !validBoeSlots[payload.ItemSlot] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid item slot"})
		return
	}

	var sale models.BoeSale
	if err := database.DB.Where("id = ? AND team_id = ?", boeSaleId, teamId).First(&sale).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "BoE sale not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to query BoE sale"})
		return
	}

	sale.PlayerName = payload.PlayerName
	sale.ItemName = payload.ItemName
	sale.ItemSlot = payload.ItemSlot
	sale.SalePrice = payload.SalePrice
	sale.SoldToPlayer = payload.SoldToPlayer
	if err := database.DB.Save(&sale).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save BoE sale"})
		return
	}

	c.JSON(http.StatusOK, toBoeSaleResponse(sale))
}

func DeleteBoeSale(c *gin.Context) {
	user, ok := getRequestingUser(c)
	if !ok {
		return
	}

	teamId, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	boeSaleId, err := strconv.ParseUint(c.Param("boeSaleId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid BoE sale ID"})
		return
	}

	if !isLootCouncilOrAdmin(uint(teamId), user.ID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if err := database.DB.Where("id = ? AND team_id = ?", boeSaleId, teamId).Delete(&models.BoeSale{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete BoE sale"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
