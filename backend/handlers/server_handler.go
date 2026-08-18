package handlers

import (
	"krankenprep/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetServers(c *gin.Context) {
	servers, err := getCachedServers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to query servers"})
		return
	}

	if region := c.Query("region"); region != "" {
		filtered := make([]models.Server, 0, len(servers))
		for _, s := range servers {
			if s.Region == region {
				filtered = append(filtered, s)
			}
		}
		servers = filtered
	}

	c.JSON(http.StatusOK, servers)
}
