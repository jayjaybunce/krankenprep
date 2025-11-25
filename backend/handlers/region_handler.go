package handlers

import (
	"krankenprep/database"
	"krankenprep/models"
	"net/http"
	"sort"

	"github.com/gin-gonic/gin"
)

func GetRegions(c *gin.Context) {
	var regions []string

	// DISTINCT region values
	if err := database.DB.
		Model(&models.Server{}).
		Distinct().
		Pluck("region", &regions).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to load regions",
		})
		return
	}

	// Optional: sort nicely
	sort.Strings(regions)

	c.JSON(http.StatusOK, regions)
}
