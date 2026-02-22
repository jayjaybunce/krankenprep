package handlers

import (
	"krankenprep/database"
	"krankenprep/models"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
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

func GetMe(c *gin.Context) {
	user, _ := c.Get("user")
	// We can trust this to be UTD - We set the user in context in middleware on every request
	c.JSON(http.StatusOK, user)

}

func GetMyTeams(c *gin.Context) {
	val, _ := c.Get("user")
	user, _ := val.(*models.User)
	log.Printf("Found user with id: %v", user.ID)

	roles := []models.Role{}
	database.DB.Model(&models.Role{}).Where("user_id = ?", user.ID).Joins("Team").Preload("Team.WishlistConfigs").Find(&roles)
	c.JSON(http.StatusOK, roles)

	// c.JSON(http.StatusOK, "in /me/teams")

}
