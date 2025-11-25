package main

import (
	"krankenprep/middleware"
	"krankenprep/utilities"
	"log"

	"krankenprep/database"
	"krankenprep/handlers"
	"krankenprep/seed"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}
	database.Connect()

	if err := seed.RunSeeders(database.DB); err != nil {
		log.Fatal(err)
	}

	if err := utilities.InitDescopeClient(); err != nil {
		log.Fatalf("Failed to initialize Descope client: %v", err)
	}

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
		},
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders: []string{
			"Origin",
			"Authorization",
			"Content-Type",
			"Accept",
			"Content-Length",
		},
		ExposeHeaders: []string{
			"Content-Length",
			"Authorization",
		},
		AllowCredentials: true,
	}))

	r.Use(middleware.AuthMiddleware())
	r.GET("/servers", handlers.GetServers)
	r.GET("/regions", handlers.GetRegions)
	r.POST("/team", handlers.CreateTeam)
	r.GET("/me", handlers.GetMe)
	r.GET("/me/teams", handlers.GetMyTeams)

	log.Println("Server started on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
