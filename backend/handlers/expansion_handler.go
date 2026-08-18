package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetExpansions(c *gin.Context) {
	expansions, err := getCachedExpansions()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to query expansions"})
		return
	}

	c.JSON(http.StatusOK, expansions)
}
