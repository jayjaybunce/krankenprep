package handlers

import (
	"context"
	"krankenprep/database"
	"krankenprep/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// isTeamMember checks whether the given user holds any role on the team.
func isTeamMember(teamId uint, userId uint) bool {
	role := models.Role{}
	err := database.DB.Where("team_id = ? AND user_id = ?", teamId, userId).First(&role).Error
	return err == nil
}

// isTeamAdmin checks whether the given user holds an owner/admin role on the team.
func isTeamAdmin(teamId uint, userId uint) bool {
	role := models.Role{}
	err := database.DB.Where("team_id = ? AND user_id = ? AND name IN ?", teamId, userId, []string{"owner", "admin"}).First(&role).Error
	return err == nil
}

// isTeamOwner checks whether the given user holds specifically the owner
// role on the team — stricter than isTeamAdmin, for actions scoped to just
// the owner (e.g. triggering a global tier-sim data refresh).
func isTeamOwner(teamId uint, userId uint) bool {
	role := models.Role{}
	err := database.DB.Where("team_id = ? AND user_id = ? AND name = ?", teamId, userId, models.RoleOwner).First(&role).Error
	return err == nil
}

// isLootCouncilOrAdmin checks whether the given user can edit any team
// member's loot sheet — owners/admins already have full edit rights
// everywhere else in the app, so this accepts that same set rather than
// requiring the literal loot_council role (which, since roles are mutually
// exclusive, would otherwise lock owners/admins out unless they demoted
// themselves first).
func isLootCouncilOrAdmin(teamId uint, userId uint) bool {
	role := models.Role{}
	err := database.DB.Where("team_id = ? AND user_id = ? AND name IN ?", teamId, userId,
		[]string{models.RoleOwner, models.RoleAdmin, models.RoleLootCouncil}).First(&role).Error
	return err == nil
}

type CreatePlayerPayload struct {
	Name      string `json:"name"`
	Battletag string `json:"battletag"`
	UserID    *uint  `json:"user_id"`
}

func CreatePlayer(c *gin.Context) {
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

	if !isTeamAdmin(uint(teamId), user.ID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var payload CreatePlayerPayload
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	player := models.Player{
		TeamID:    uint(teamId),
		Name:      payload.Name,
		Battletag: payload.Battletag,
		UserID:    payload.UserID,
	}

	ctx := context.Background()
	result := gorm.WithResult()
	if err := gorm.G[models.Player](database.DB, result).Create(ctx, &player); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create player"})
		return
	}

	c.JSON(http.StatusCreated, player)
}

type UpdatePlayerPayload struct {
	Name      string `json:"name"`
	Battletag string `json:"battletag"`
	UserID    *uint  `json:"user_id"`
}

func UpdatePlayer(c *gin.Context) {
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

	playerIdParam := c.Param("playerId")
	playerId, err := strconv.ParseUint(playerIdParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid player id"})
		return
	}

	player := models.Player{}
	if err := database.DB.First(&player, playerId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "player not found"})
		return
	}

	if !isTeamAdmin(player.TeamID, user.ID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var payload UpdatePlayerPayload
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	player.Name = payload.Name
	player.Battletag = payload.Battletag
	player.UserID = payload.UserID

	if err := database.DB.Save(&player).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update player"})
		return
	}

	c.JSON(http.StatusOK, player)
}

func DeletePlayer(c *gin.Context) {
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

	playerIdParam := c.Param("playerId")
	playerId, err := strconv.ParseUint(playerIdParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid player id"})
		return
	}

	player := models.Player{}
	if err := database.DB.First(&player, playerId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "player not found"})
		return
	}

	if !isTeamAdmin(player.TeamID, user.ID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if err := database.DB.Select("Characters").Delete(&player).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to remove player"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "player removed from roster"})
}

// ClaimPlayer lets a team member self-service claim an unclaimed roster
// Player as their own, so the app knows which characters belong to them.
// One user can claim at most one Player per team; claiming is exclusive.
func ClaimPlayer(c *gin.Context) {
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

	playerIdParam := c.Param("playerId")
	playerId, err := strconv.ParseUint(playerIdParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid player id"})
		return
	}

	player := models.Player{}
	if err := database.DB.First(&player, playerId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "player not found"})
		return
	}

	if !isTeamMember(player.TeamID, user.ID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not a member of this team"})
		return
	}

	if player.UserID != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "player is already claimed"})
		return
	}

	var existingClaim models.Player
	err = database.DB.Where("team_id = ? AND user_id = ?", player.TeamID, user.ID).First(&existingClaim).Error
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "you have already claimed a player on this team"})
		return
	} else if err != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check existing claim"})
		return
	}

	player.UserID = &user.ID
	if err := database.DB.Save(&player).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to claim player"})
		return
	}

	c.JSON(http.StatusOK, player)
}

// UnclaimPlayer lets a user release their own claim on a Player (e.g. they
// claimed the wrong one by mistake). Only the user who currently holds the
// claim can release it — there's no admin override for now.
func UnclaimPlayer(c *gin.Context) {
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

	playerIdParam := c.Param("playerId")
	playerId, err := strconv.ParseUint(playerIdParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid player id"})
		return
	}

	player := models.Player{}
	if err := database.DB.First(&player, playerId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "player not found"})
		return
	}

	if player.UserID == nil || *player.UserID != user.ID {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "you have not claimed this player"})
		return
	}

	player.UserID = nil
	if err := database.DB.Save(&player).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to unclaim player"})
		return
	}

	c.JSON(http.StatusOK, player)
}
