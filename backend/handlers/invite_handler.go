package handlers

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"krankenprep/database"
	"krankenprep/models"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const (
	inviteTokenBytes = 32
)

func NewToken() (string, error) {
	b := make([]byte, inviteTokenBytes)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("rand read %w", err)
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

func HashTokenSHA256(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

func parseClientTimeToUTC(s string) (time.Time, error) {
	t, err := time.Parse(time.RFC3339, s)
	if err != nil {
		_, err := time.Parse(time.RFC3339Nano, s)
		if err != nil {
			return time.Time{}, err
		}
	}
	return t.UTC(), nil
}

type CreateInviteLinkPayload struct {
	TeamId    uint   `json:"team_id"`
	ExpiresAt string `json:"expires_at"`
	MaxUses   int    `json:"max_uses"`
}

func CreateInviteLink(c *gin.Context) {
	val, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User context is broken"})
		return
	}
	user, ok := val.(*models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user type"})
	}

	var createInviteLinkPayload CreateInviteLinkPayload
	if err := c.BindJSON(&createInviteLinkPayload); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid request payload"})
		return
	}

	expiresAt, err := parseClientTimeToUTC(createInviteLinkPayload.ExpiresAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid expires at field on payload"})
	}

	log.Printf("Team id param %v", createInviteLinkPayload.TeamId)

	log.Printf("User %v attempting to create invite link for team %v and user %v", user.ID, createInviteLinkPayload.TeamId, user.ID)
	var role models.Role
	if err := database.DB.Where("team_id = ? and user_id = ? and name in ?", createInviteLinkPayload.TeamId, user.ID, []string{"owner", "admin"}).First(&role).Error; err != nil {
		log.Printf("Role not found for user %v and team %v", user.ID, createInviteLinkPayload.TeamId)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User lacks permission"})
		return
	}

	token, err := NewToken()
	if err != nil {
		log.Print("Error creating token for invite link")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating invite link token"})
	}

	hashedToken := HashTokenSHA256(token)

	log.Printf("Created a new token %v with hash %v", token, hashedToken)

	ctx := context.Background()
	result := gorm.WithResult()
	inviteLink := models.InviteLink{
		TeamId:          createInviteLinkPayload.TeamId,
		CreatedByUserId: user.ID,
		TokenHash:       hashedToken,
		CreatedAt:       time.Now(),
		ExpiresAt:       expiresAt,
		MaxUses:         createInviteLinkPayload.MaxUses,
		Uses:            0,
	}
	err = gorm.G[models.InviteLink](database.DB, result).Create(ctx, &inviteLink)
	if err != nil {
		log.Printf("Error creating invite link: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create invite link"})
	}
	c.JSON(http.StatusCreated, gin.H{
		"message": "Link created succesfully",
		"token":   token,
	})

}

func GetInviteLink(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token parameter is required"})
		return
	}

	hashedToken := HashTokenSHA256(token)

	var inviteLink models.InviteLink
	if err := database.DB.Preload("Team").Preload("CreatedByUser").Where("token_hash = ?", hashedToken).First(&inviteLink).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Invite link not found"})
			return
		}
		log.Printf("Error retrieving invite link: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve invite link"})
		return
	}

	c.JSON(http.StatusOK, inviteLink)
}

func GetTeamInviteLinks(c *gin.Context) {
	// Get authenticated user
	val, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User context is broken"})
		return
	}
	user, ok := val.(*models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user type"})
		return
	}

	// Get team_id from URL params
	teamID := c.Param("team_id")
	if teamID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Team ID parameter is required"})
		return
	}

	// Validate user is a member of the team and has admin role
	var role models.Role
	if err := database.DB.Where("team_id = ? AND user_id = ? AND name IN ?", teamID, user.ID, []string{"owner", "admin"}).First(&role).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusForbidden, gin.H{"error": "User lacks permission to view invite links"})
			return
		}
		log.Printf("Error checking user role: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify permissions"})
		return
	}

	// Retrieve all invite links for the team
	var inviteLinks []models.InviteLink
	if err := database.DB.Preload("CreatedByUser").Where("team_id = ?", teamID).Find(&inviteLinks).Error; err != nil {
		log.Printf("Error retrieving invite links: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve invite links"})
		return
	}

	c.JSON(http.StatusOK, inviteLinks)
}

func RevokeInviteLink(c *gin.Context) {
	// Get authenticated user
	val, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User context is broken"})
		return
	}
	user, ok := val.(*models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user type"})
		return
	}

	// Get invite link ID from URL params
	tokenHash := c.Query("token")
	if tokenHash == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invite link ID parameter is required"})
		return
	}

	// Retrieve invite link
	var inviteLink models.InviteLink
	if err := database.DB.Where("token_hash = ?", tokenHash).First(&inviteLink).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Invite link not found"})
			return
		}
		log.Printf("Error retrieving invite link: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve invite link"})
		return
	}

	// Validate user is admin/owner of the team
	var role models.Role
	if err := database.DB.Where("team_id = ? AND user_id = ? AND name IN ?", inviteLink.TeamId, user.ID, []string{"owner", "admin"}).First(&role).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusForbidden, gin.H{"error": "User lacks permission to revoke invite links"})
			return
		}
		log.Printf("Error checking user role: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify permissions"})
		return
	}

	// Check if already revoked
	if inviteLink.RevokedAt != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invite link is already revoked"})
		return
	}

	// Revoke the invite link
	now := time.Now()
	if err := database.DB.Model(&inviteLink).Update("revoked_at", now).Error; err != nil {
		log.Printf("Error revoking invite link: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to revoke invite link"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Invite link revoked successfully",
		"revoked_at": now,
	})
}

func RedeemInviteLink(c *gin.Context) {
	// Get authenticated user
	val, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User context is broken"})
		return
	}
	user, ok := val.(*models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user type"})
		return
	}

	// Get token from query params
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token parameter is required"})
		return
	}

	hashedToken := HashTokenSHA256(token)

	// Retrieve invite link
	var inviteLink models.InviteLink
	if err := database.DB.Where("token_hash = ?", hashedToken).First(&inviteLink).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Invite link not found"})
			return
		}
		log.Printf("Error retrieving invite link: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve invite link"})
		return
	}

	// Validate not revoked
	if inviteLink.RevokedAt != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invite link has been revoked"})
		return
	}

	// Validate not expired
	if time.Now().After(inviteLink.ExpiresAt) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invite link has expired"})
		return
	}

	// Validate max uses not exceeded
	if inviteLink.MaxUses > 0 && inviteLink.Uses >= inviteLink.MaxUses {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invite link has reached maximum uses"})
		return
	}

	// Check if user is already a member of the team
	var existingRole models.Role
	err := database.DB.Where("team_id = ? AND user_id = ?", inviteLink.TeamId, user.ID).First(&existingRole).Error
	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User is already a member of this team"})
		return
	}
	if err != gorm.ErrRecordNotFound {
		log.Printf("Error checking existing role: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify team membership"})
		return
	}

	// Begin transaction
	tx := database.DB.Begin()
	if tx.Error != nil {
		log.Printf("Error starting transaction: %v", tx.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to redeem invite link"})
		return
	}

	// Create role to add user to team
	role := models.Role{
		TeamID: inviteLink.TeamId,
		UserID: user.ID,
		Name:   "member", // Default role for new members
	}
	if err := tx.Create(&role).Error; err != nil {
		tx.Rollback()
		log.Printf("Error creating role: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add user to team"})
		return
	}

	// Increment uses counter
	if err := tx.Model(&inviteLink).Update("uses", inviteLink.Uses+1).Error; err != nil {
		tx.Rollback()
		log.Printf("Error updating invite link uses: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update invite link"})
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		log.Printf("Error committing transaction: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to redeem invite link"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully joined team",
		"team_id": inviteLink.TeamId,
	})
}
