package handlers

import (
	"fmt"
	"krankenprep/database"
	"krankenprep/models"
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
	// descopeClient, err := client.NewWithConfig(&client.Config{
	// 	ProjectID:         "P35frQ7r7as6OKIhaOvbggFpjyJh",
	// 	AuthManagementKey: "K35ilChMPNhjz4aO7ZJbZmfFwgmhYcT4WhwE1USXpYcQZRWpIWEVKxgQuG5m98L3FQsZmDW",
	// })
	fmt.Println("bang")

}
