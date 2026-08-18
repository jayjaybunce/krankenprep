package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetClasses(c *gin.Context) {
	classes, err := getCachedClasses()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to query classes"})
		return
	}

	c.JSON(http.StatusOK, classes)
}
