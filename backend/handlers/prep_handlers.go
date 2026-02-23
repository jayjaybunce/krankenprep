package handlers

import (
	"context"
	"errors"
	"krankenprep/database"
	"krankenprep/models"
	"krankenprep/utilities"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type CreateSectionPayload struct {
	TeamID      uint   `json:"team_id"`
	BossID      uint   `json:"boss_id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Variant     string `json:"variant"`
	Tags        string `json:"tags"`
}

func CreateSection(c *gin.Context) {
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

	var createSectionPayload CreateSectionPayload

	if err := c.BindJSON(&createSectionPayload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	log.Printf("User %v attempting to create section for team %v and boss %v", user.ID, createSectionPayload.TeamID, createSectionPayload.BossID)

	// Validate that team exists and user has access
	var team models.Team
	if err := database.DB.First(&team, createSectionPayload.TeamID).Error; err != nil {
		log.Printf("Team not found: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	// Validate that boss exists
	var boss models.Boss
	if err := database.DB.First(&boss, createSectionPayload.BossID).Error; err != nil {
		log.Printf("Boss not found: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Boss not found"})
		return
	}

	// Create the section
	now := time.Now()
	section := models.Section{
		Name:        createSectionPayload.Name,
		Description: createSectionPayload.Description,
		Tags:        createSectionPayload.Tags,
		Variant:     createSectionPayload.Variant,
		TeamID:      createSectionPayload.TeamID,
		BossID:      createSectionPayload.BossID,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	result := gorm.WithResult()
	err := gorm.G[models.Section](database.DB, result).Create(ctx, &section)
	if err != nil {
		log.Printf("Error creating section: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create section"})
		return
	}

	log.Printf("SUCCESS: Created section with id %v for team %v and boss %v", section.ID, team.ID, boss.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Section created successfully",
		"section": section,
	})
}

func GetSectionsByTeamAndBoss(c *gin.Context) {
	_, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User context is broken"})
		return
	}

	teamIDParam := c.Param("teamId")
	bossIDParam := c.Param("bossId")

	teamID, err := strconv.ParseUint(teamIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	bossID, err := strconv.ParseUint(bossIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid boss ID"})
		return
	}

	var sections []models.Section
	if err := database.DB.
		Where("team_id = ? AND boss_id = ?", teamID, bossID).
		Preload("Team").
		Preload("Boss").
		Preload("Notes").
		Find(&sections).Error; err != nil {
		log.Printf("Error fetching sections: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch sections"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"sections": sections,
	})
}

type CreateNotePayload struct {
	SectionID uint   `json:"section_id"`
	Content   string `json:"content"`
}

func CreateNote(c *gin.Context) {
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

	var createNotePayload CreateNotePayload

	if err := c.BindJSON(&createNotePayload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	log.Printf("User %v attempting to create note for section %v", user.ID, createNotePayload.SectionID)

	// Validate that section exists
	var section models.Section
	if err := database.DB.First(&section, createNotePayload.SectionID).Error; err != nil {
		log.Printf("Section not found: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Section not found"})
		return
	}

	// Create the note
	now := time.Now()
	note := models.Note{
		SectionID: createNotePayload.SectionID,
		Content:   createNotePayload.Content,
		CreatedAt: now,
		UpdatedAt: now,
	}

	result := gorm.WithResult()
	err := gorm.G[models.Note](database.DB, result).Create(ctx, &note)
	if err != nil {
		log.Printf("Error creating note: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create note"})
		return
	}

	log.Printf("SUCCESS: Created note with id %v for section %v", note.ID, section.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Note created successfully",
		"note":    note,
	})
}

func GetNotesBySection(c *gin.Context) {
	_, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User context is broken"})
		return
	}

	sectionIDParam := c.Param("sectionId")

	sectionID, err := strconv.ParseUint(sectionIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid section ID"})
		return
	}

	// Validate that section exists
	var section models.Section
	if err := database.DB.First(&section, sectionID).Error; err != nil {
		log.Printf("Section not found: %v", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Section not found"})
		return
	}

	var notes []models.Note
	if err := database.DB.
		Where("section_id = ?", sectionID).
		Find(&notes).Error; err != nil {
		log.Printf("Error fetching notes: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notes"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"notes": notes,
	})
}

type UpdateSectionPayload struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Variant     string `json:"variant"`
	Tags        string `json:"tags"`
}

func UpdateSection(c *gin.Context) {
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

	sectionIDParam := c.Param("sectionId")
	sectionID, err := strconv.ParseUint(sectionIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid section ID"})
		return
	}

	var payload UpdateSectionPayload
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	var section models.Section
	if err := database.DB.First(&section, sectionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Section not found"})
		return
	}

	var role models.Role
	if err := database.DB.Where("user_id = ? AND team_id = ? AND name IN ?", user.ID, section.TeamID, []string{"owner", "admin"}).First(&role).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to update this section"})
		return
	}

	updates := map[string]any{
		"name":        payload.Name,
		"description": payload.Description,
		"variant":     payload.Variant,
		"tags":        payload.Tags,
	}
	if err := database.DB.Model(&section).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update section"})
		return
	}

	database.DB.Preload("Notes").First(&section, sectionID)
	c.JSON(http.StatusOK, gin.H{"section": section})
}

func DeleteSection(c *gin.Context) {
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

	sectionIDParam := c.Param("sectionId")
	sectionID, err := strconv.ParseUint(sectionIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid section ID"})
		return
	}

	var section models.Section
	if err := database.DB.First(&section, sectionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Section not found"})
		return
	}

	var role models.Role
	if err := database.DB.Where("user_id = ? AND team_id = ? AND name IN ?", user.ID, section.TeamID, []string{"owner", "admin"}).First(&role).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to delete this section"})
		return
	}

	if err := database.DB.Delete(&section).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete section"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Section deleted successfully"})
}

type UpdateNotePayload struct {
	Content string `json:"content"`
}

func UpdateNote(c *gin.Context) {
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

	noteIDParam := c.Param("noteId")
	noteID, err := strconv.ParseUint(noteIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid note ID"})
		return
	}

	var payload UpdateNotePayload
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	var note models.Note
	if err := database.DB.Preload("Section").First(&note, noteID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Note not found"})
		return
	}

	var role models.Role
	if err := database.DB.Where("user_id = ? AND team_id = ? AND name IN ?", user.ID, note.Section.TeamID, []string{"owner", "admin"}).First(&role).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to update this note"})
		return
	}

	if err := database.DB.Model(&note).Update("content", payload.Content).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update note"})
		return
	}

	database.DB.First(&note, noteID)
	c.JSON(http.StatusOK, gin.H{"note": note})
}

func DeleteNote(c *gin.Context) {
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

	noteIDParam := c.Param("noteId")
	noteID, err := strconv.ParseUint(noteIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid note ID"})
		return
	}

	var note models.Note
	if err := database.DB.Preload("Section").First(&note, noteID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Note not found"})
		return
	}

	var role models.Role
	if err := database.DB.Where("user_id = ? AND team_id = ? AND name IN ?", user.ID, note.Section.TeamID, []string{"owner", "admin"}).First(&role).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to delete this note"})
		return
	}

	if err := database.DB.Delete(&note).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete note"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Note deleted successfully"})
}

type CreateRaidplanPayload struct {
	Name     string         `json:"name"`
	Content  datatypes.JSON `json:"content"`
	UserID   uint           `json:"user_id"`
	Boss     string         `json:"boss"`
	Raid     string         `json:"raid"`
	Sequence string         `json:"sequence"`
}

func CreateRaidplan(c *gin.Context) {
	ctx := context.Background()

	var payload CreateRaidplanPayload
	if err := c.BindJSON(&payload); err != nil {
		log.Printf("Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload", "details": err.Error()})
		return
	}

	// Generate share and edit IDs
	shareID, editID, err := utilities.GenerateRaidPlanIDs()
	if err != nil {
		log.Printf("Error generating raid plan IDs: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate raid plan IDs"})
		return
	}

	// Create the raid plan
	now := time.Now()
	raidPlan := models.RaidPlan{
		ShareID:   shareID,
		EditID:    editID,
		Name:      payload.Name,
		Content:   payload.Content,
		Boss:      payload.Boss,
		Raid:      payload.Raid,
		Sequence:  payload.Sequence,
		CreatedAt: now,
		UpdatedAt: now,
	}

	// If UserID is provided, attach the user
	if payload.UserID != 0 {
		raidPlan.UserID = &payload.UserID
	}

	result := gorm.WithResult()
	createErr := gorm.G[models.RaidPlan](database.DB, result).Create(ctx, &raidPlan)
	if createErr != nil {
		log.Printf("Error creating raid plan: %v", createErr)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create raid plan", "details": createErr.Error()})
		return
	}

	log.Printf("SUCCESS: Created raid plan with id %v, share_id %v", raidPlan.ID, raidPlan.ShareID)

	c.JSON(http.StatusCreated, raidPlan)
}

type UpdateRaidplanPayload struct {
	RaidplanID uint           `json:"raidplan_id"`
	Name       string         `json:"name"`
	Content    datatypes.JSON `json:"content"`
	UserID     uint           `json:"user_id"`
	Boss       string         `json:"boss"`
}

func UpdateRaidplan(c *gin.Context) {
	var payload UpdateRaidplanPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		log.Printf("Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request payload",
			"details": err.Error(),
		})
		return
	}

	// You probably have this somewhere; adjust to your app.
	db := database.DB // e.g. your global db, or models.GetDB(), etc.

	// 1) Load existing raidplan
	var raidPlan models.RaidPlan
	if err := db.Where("id = ?", payload.RaidplanID).First(&raidPlan).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Raidplan not found"})
			return
		}
		log.Printf("DB error loading raidplan %d: %v", payload.RaidplanID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load raidplan"})
		return
	}

	// 2) Authorization (example: only owner can edit)
	// Ideally get user id from auth middleware, not the payload.
	// Example if you stored it in context:
	// requesterID := c.GetUint("user_id")
	// if raidPlan.UserID != requesterID { ... }
	// if payload.UserID != 0 && raidPlan.UserID != payload.UserID {
	// 	c.JSON(http.StatusForbidden, gin.H{"error": "Not allowed to update this raidplan"})
	// 	return
	// }

	// 3) Update fields (do NOT update UserID from client)
	updates := map[string]any{
		"name":    payload.Name,
		"content": payload.Content,
		"boss":    payload.Boss,
	}

	if err := db.Model(&raidPlan).Updates(updates).Error; err != nil {
		log.Printf("DB error updating raidplan %d: %v", payload.RaidplanID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update raidplan"})
		return
	}

	// 4) Return refreshed record (optional but nice)
	if err := db.First(&raidPlan, payload.RaidplanID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Updated but failed to reload raidplan"})
		return
	}

	c.JSON(http.StatusOK, raidPlan)
}

func GetRaidplan(c *gin.Context) {
	raidplanIDparam := c.Param("raidplanId")
	var raidplan models.RaidPlan
	if err := database.DB.
		Model(&models.RaidPlan{}).
		Where("share_id = ? OR edit_id = ?", raidplanIDparam, raidplanIDparam).
		First(&raidplan).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to query for raidplan",
		})
		return
	}
	c.JSON(http.StatusOK, raidplan)

}
