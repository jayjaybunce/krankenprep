package handlers

import (
	"krankenprep/database"
	"krankenprep/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetUserRaidplans(c *gin.Context) {
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
	raidplans := []models.RaidPlan{}
	database.DB.Where("user_id = ? ", user.ID).Find(&raidplans)
	c.JSON(http.StatusOK, raidplans)

}
