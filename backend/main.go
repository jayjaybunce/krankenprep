package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"krankenprep/database"
	"krankenprep/handlers"
)

func main() {
	// connect + migrate
	database.Connect()

	r := gin.Default()

	// routes
	r.GET("/users", handlers.GetUsers)
	r.POST("/users", handlers.CreateUser)

	log.Println("Server started on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
