package handlers

import (
	"net/http"

	"krankenprep/database"

	"github.com/gin-gonic/gin"
)

type SpellSearchResult struct {
	SpellID    int    `json:"spell_id"`
	SpellName  string `json:"spell_name"`
	Filename   string `json:"filename"`
}

func SearchSpells(c *gin.Context) {
	q := c.Query("q")
	if q == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing query parameter 'q'"})
		return
	}

	var results []SpellSearchResult
	err := database.DB.Raw(`
		SELECT s.spell_id, s.spell_name, COALESCE(fd.filename, '') AS filename
		FROM spells s
		LEFT JOIN file_data fd ON s.file_data_id = fd.file_data_id
		WHERE s.spell_name % ?
		ORDER BY similarity(s.spell_name, ?) DESC
		LIMIT 10
	`, q, q).Scan(&results).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search spells"})
		return
	}

	c.JSON(http.StatusOK, results)
}
