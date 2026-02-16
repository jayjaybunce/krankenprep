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
			"https://krankenprep.io",
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

	// Public endpoints (no auth required)
	public := r.Group("/")
	{
		// Raidplan public endpoints
		public.POST("/raidplans", handlers.CreateRaidplan)
		public.GET("/raidplans/:raidplanId", handlers.GetRaidplan)
		public.PUT("/raidplans/:raidplanId", handlers.UpdateRaidplan)
	}

	// Protected endpoints (auth required)
	protected := r.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/servers", handlers.GetServers)
		protected.GET("/regions", handlers.GetRegions)
		protected.POST("/team", handlers.CreateTeam)
		protected.GET("/me", handlers.GetMe)
		protected.GET("/me/teams", handlers.GetMyTeams)
		protected.GET("/expansions", handlers.GetExpansions)
		protected.GET("/teams/bosses", handlers.GetTeamBosses)
		protected.GET("/teams/:teamId", handlers.GetTeamById)
		protected.DELETE("/teams/:teamId/member/:roleId", handlers.DeleteMemberFromTeam)

		// Section endpoints
		protected.POST("/sections", handlers.CreateSection)
		protected.GET("/teams/:teamId/sections/boss/:bossId", handlers.GetSectionsByTeamAndBoss)

		// Note endpoints
		protected.POST("/notes", handlers.CreateNote)
		protected.GET("/notes/section/:sectionId", handlers.GetNotesBySection)

		// InviteLink endpoints
		protected.POST("/teams/invite", handlers.CreateInviteLink)
		protected.POST("/teams/invite/redeem", handlers.RedeemInviteLink)
		protected.GET("/teams/invite", handlers.GetInviteLink)
		protected.DELETE("/teams/invite", handlers.RevokeInviteLink)

		// Spell endpoints
		protected.GET("/spells/search", handlers.SearchSpells)

		// Raidplan protected endpoints
		protected.GET("/me/raidplans", handlers.GetUserRaidplans)
	}

	log.Println("Server started on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
