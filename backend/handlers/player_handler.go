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

// isTeamAdmin checks whether the given user holds an owner/admin role on the team.
func isTeamAdmin(teamId uint, userId uint) bool {
	role := models.Role{}
	err := database.DB.Where("team_id = ? AND user_id = ? AND name IN ?", teamId, userId, []string{"owner", "admin"}).First(&role).Error
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
