package handlers

import (
	"krankenprep/database"
	"krankenprep/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetClasses(c *gin.Context) {
	var classes []models.Class

	if err := database.DB.Preload("Specializations").Order("name ASC").Find(&classes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to query classes"})
		return
	}

	c.JSON(http.StatusOK, classes)
}
