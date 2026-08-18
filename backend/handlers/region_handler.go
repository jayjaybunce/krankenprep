package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetRegions(c *gin.Context) {
	servers, err := getCachedServers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load regions"})
		return
	}

	c.JSON(http.StatusOK, distinctRegions(servers))
}
