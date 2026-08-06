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

type CreateCharacterPayload struct {
	Name             string `json:"name"`
	Class            string `json:"class"`
	Realm            string `json:"realm"`
	Region           string `json:"region"`
	IsMain           bool   `json:"is_main"`
	SpecializationID *uint  `json:"specialization_id"`
}

func CreateCharacter(c *gin.Context) {
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

	var payload CreateCharacterPayload
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	character := models.Character{
		PlayerID:         uint(playerId),
		Name:             payload.Name,
		Class:            payload.Class,
		Realm:            payload.Realm,
		Region:           payload.Region,
		IsMain:           payload.IsMain,
		SpecializationID: payload.SpecializationID,
	}

	err = database.DB.Transaction(func(tx *gorm.DB) error {
		if character.IsMain {
			if err := tx.Model(&models.Character{}).
				Where("player_id = ? AND is_main = ?", playerId, true).
				Update("is_main", false).Error; err != nil {
				return err
			}
		}

		ctx := context.Background()
		result := gorm.WithResult()
		return gorm.G[models.Character](tx, result).Create(ctx, &character)
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create character"})
		return
	}

	c.JSON(http.StatusCreated, character)
}

type UpdateCharacterPayload struct {
	Name             string `json:"name"`
	Class            string `json:"class"`
	Realm            string `json:"realm"`
	Region           string `json:"region"`
	IsMain           bool   `json:"is_main"`
	SpecializationID *uint  `json:"specialization_id"`
}

func UpdateCharacter(c *gin.Context) {
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

	characterIdParam := c.Param("characterId")
	characterId, err := strconv.ParseUint(characterIdParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid character id"})
		return
	}

	character := models.Character{}
	if err := database.DB.First(&character, characterId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "character not found"})
		return
	}

	player := models.Player{}
	if err := database.DB.First(&player, character.PlayerID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "player not found"})
		return
	}

	if !isTeamAdmin(player.TeamID, user.ID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var payload UpdateCharacterPayload
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	character.Name = payload.Name
	character.Class = payload.Class
	character.Realm = payload.Realm
	character.Region = payload.Region
	character.IsMain = payload.IsMain
	character.SpecializationID = payload.SpecializationID

	err = database.DB.Transaction(func(tx *gorm.DB) error {
		if character.IsMain {
			if err := tx.Model(&models.Character{}).
				Where("player_id = ? AND is_main = ? AND id != ?", character.PlayerID, true, character.ID).
				Update("is_main", false).Error; err != nil {
				return err
			}
		}
		return tx.Save(&character).Error
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update character"})
		return
	}

	c.JSON(http.StatusOK, character)
}

func DeleteCharacter(c *gin.Context) {
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

	characterIdParam := c.Param("characterId")
	characterId, err := strconv.ParseUint(characterIdParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid character id"})
		return
	}

	character := models.Character{}
	if err := database.DB.First(&character, characterId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "character not found"})
		return
	}

	player := models.Player{}
	if err := database.DB.First(&player, character.PlayerID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "player not found"})
		return
	}

	if !isTeamAdmin(player.TeamID, user.ID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if err := database.DB.Delete(&character).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to remove character"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "character removed from roster"})
}
