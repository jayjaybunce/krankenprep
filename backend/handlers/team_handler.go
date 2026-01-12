package handlers

import (
	"context"
	"krankenprep/database"
	"krankenprep/models"
	"log"
	"net/http"
	"strconv"

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
	if err := database.DB.Preload("InviteLinks").Preload("Roles").Preload("Roles.User").Where("id = ?", teamId).Find(&team).Error; err != nil {
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
