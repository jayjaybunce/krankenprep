package handlers

import (
	"context"
	"krankenprep/database"
	"krankenprep/models"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CreatTeamPayload struct {
	Name   string `json:"name"`
	RioUrl string `json:"rio_url"`
	Server string `json:"server"`
	Region string `json:"region"`
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

	team := models.Team{Name: createTeamPayload.Name, RioUrl: createTeamPayload.RioUrl, Region: createTeamPayload.Region, Server: createTeamPayload.Server}
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
