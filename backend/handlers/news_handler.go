package handlers

import (
	"krankenprep/database"
	"krankenprep/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetNews(c *gin.Context) {
	var news []models.News

	if err := database.DB.Order("published_at DESC").Find(&news).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to query news"})
		return
	}

	c.JSON(http.StatusOK, news)
}
