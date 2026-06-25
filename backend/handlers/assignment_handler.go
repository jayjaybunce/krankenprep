package handlers

import (
	"errors"
	"krankenprep/database"
	"krankenprep/models"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetAssignmentNote(c *gin.Context) {
	_, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User context is broken"})
		return
	}

	teamID, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	bossID, err := strconv.ParseUint(c.Param("bossId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid boss ID"})
		return
	}

	var note models.AssignmentNote
	if err := database.DB.Where("team_id = ? AND boss_id = ?", teamID, bossID).First(&note).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusOK, gin.H{"assignment_note": models.AssignmentNote{TeamID: uint(teamID), BossID: uint(bossID)}})
			return
		}
		log.Printf("Error fetching assignment note: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch assignment note"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"assignment_note": note})
}

type UpsertAssignmentNotePayload struct {
	Note string `json:"note"`
}

func UpsertAssignmentNote(c *gin.Context) {
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

	teamID, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	bossID, err := strconv.ParseUint(c.Param("bossId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid boss ID"})
		return
	}

	var role models.Role
	if err := database.DB.Where("user_id = ? AND team_id = ? AND name IN ?", user.ID, teamID, []string{"owner", "admin"}).First(&role).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized"})
		return
	}

	var payload UpsertAssignmentNotePayload
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	var note models.AssignmentNote
	result := database.DB.Where("team_id = ? AND boss_id = ?", teamID, bossID).First(&note)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		note = models.AssignmentNote{
			Note:   payload.Note,
			TeamID: uint(teamID),
			BossID: uint(bossID),
		}
		if err := database.DB.Create(&note).Error; err != nil {
			log.Printf("Error creating assignment note: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create assignment note"})
			return
		}
	} else if result.Error != nil {
		log.Printf("Error fetching assignment note for upsert: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch assignment note"})
		return
	} else {
		if err := database.DB.Model(&note).Update("note", payload.Note).Error; err != nil {
			log.Printf("Error updating assignment note: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update assignment note"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"assignment_note": note})
}
