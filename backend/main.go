package main

import (
	"krankenprep/middleware"
	"krankenprep/utilities"
	"log"

	"krankenprep/database"
	"krankenprep/handlers"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// connect + migrate
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}
	database.Connect()
	if err := utilities.InitDescopeClient(); err != nil {
		log.Fatalf("Failed to initialize Descope client: %v", err)
	}

	r := gin.Default()
	r.Use(middleware.AuthMiddleware())

	// routes
	r.GET("/users", handlers.GetUsers)
	r.POST("/users", handlers.CreateUser)
	r.GET("/me", handlers.GetMe)

	log.Println("Server started on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
