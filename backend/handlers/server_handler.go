package handlers

import (
	"fmt"
	"krankenprep/database"
	"krankenprep/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetServers(c *gin.Context) {
	var servers []models.Server

	query := database.DB.Model(&models.Server{}).Order("name ASC")

	if region := c.Query("region"); region != "" {
		query = query.Where("region = ?", region)
	}

	if err := query.Find(&servers).Error; err != nil {
		fmt.Printf("querying servers: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to query servers"})
		return
	}

	c.JSON(http.StatusOK, servers)
}
