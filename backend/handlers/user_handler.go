package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"krankenprep/database"
	"krankenprep/models"
)

func GetUsers(c *gin.Context) {
	var users []models.User
	database.DB.Find(&users)
	c.JSON(http.StatusOK, users)
}

func CreateUser(c *gin.Context) {
	var body models.User
	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := models.User{
		Email: body.Email,
		Name:  body.Name,
	}

	database.DB.Create(&user)
	c.JSON(http.StatusCreated, user)
}
