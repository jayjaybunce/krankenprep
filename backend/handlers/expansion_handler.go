package handlers

import (
	"krankenprep/database"
	"krankenprep/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetExpansions(c *gin.Context) {
	// val, exists := c.Get("user")
	// if !exists {
	// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "User context is broken"})
	// 	return
	// }
	// user, _ := val.(*models.User)
	expansions := []models.Expansion{}
	database.DB.Preload("Seasons", func(db *gorm.DB) *gorm.DB {
		return db.Order("seasons.order DESC")
	}).Preload("Seasons.Raids").Preload("Seasons.Raids.Bosses").Where("expansions.is_current = ?", true).Find(&expansions)
	c.JSON(http.StatusOK, expansions)

}
