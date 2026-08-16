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
			"https://localhost:3000",
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
		public.GET("/teams/invite", handlers.GetInviteLink)
	}

	// Protected endpoints (auth required)
	protected := r.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/servers", handlers.GetServers)
		protected.GET("/regions", handlers.GetRegions)
		protected.GET("/classes", handlers.GetClasses)
		protected.POST("/team", handlers.CreateTeam)
		protected.PUT("/teams/:teamId", handlers.UpdateTeam)
		protected.POST("/teams/wowaudit/test", handlers.TestWowAuditIntegration)
		protected.POST("/teams/:teamId/wowaudit/sync", handlers.SyncWowAuditWishlists)
		protected.POST("/teams/:teamId/wowaudit/upload", handlers.UploadDroptimizer)
		protected.POST("/teams/wowutils/test", handlers.TestWowUtilsIntegration)
		protected.POST("/teams/:teamId/wowutils/upload", handlers.UploadDroptimizerToWowUtils)
		protected.GET("/me", handlers.GetMe)
		protected.GET("/me/teams", handlers.GetMyTeams)
		protected.GET("/expansions", handlers.GetExpansions)
		protected.GET("/teams/bosses", handlers.GetTeamBosses)
		protected.GET("/teams/:teamId", handlers.GetTeamById)
		protected.DELETE("/teams/:teamId/member/:roleId", handlers.DeleteMemberFromTeam)
		protected.PUT("/teams/:teamId/member/:roleId", handlers.UpdateMemberRole)

		// Player/Character (roster) endpoints
		protected.POST("/teams/:teamId/players", handlers.CreatePlayer)
		protected.PUT("/players/:playerId", handlers.UpdatePlayer)
		protected.DELETE("/players/:playerId", handlers.DeletePlayer)
		protected.POST("/players/:playerId/claim", handlers.ClaimPlayer)
		protected.DELETE("/players/:playerId/claim", handlers.UnclaimPlayer)
		protected.POST("/players/:playerId/characters", handlers.CreateCharacter)
		protected.PUT("/characters/:characterId", handlers.UpdateCharacter)
		protected.DELETE("/characters/:characterId", handlers.DeleteCharacter)

		// Section endpoints
		protected.POST("/sections", handlers.CreateSection)
		protected.PUT("/sections/:sectionId", handlers.UpdateSection)
		protected.DELETE("/sections/:sectionId", handlers.DeleteSection)
		protected.GET("/teams/:teamId/sections/boss/:bossId", handlers.GetSectionsByTeamAndBoss)

		// Note endpoints
		protected.POST("/notes", handlers.CreateNote)
		protected.PUT("/notes/:noteId", handlers.UpdateNote)
		protected.DELETE("/notes/:noteId", handlers.DeleteNote)
		protected.GET("/notes/section/:sectionId", handlers.GetNotesBySection)

		// InviteLink endpoints
		protected.POST("/teams/invite", handlers.CreateInviteLink)
		protected.POST("/teams/invite/redeem", handlers.RedeemInviteLink)
		protected.DELETE("/teams/invite", handlers.RevokeInviteLink)

		// Assignment note endpoints
		protected.GET("/teams/:teamId/assignment-note/boss/:bossId", handlers.GetAssignmentNote)
		protected.PUT("/teams/:teamId/assignment-note/boss/:bossId", handlers.UpsertAssignmentNote)

		// Loot wishlist endpoints
		protected.GET("/teams/:teamId/loot/boss/:bossId", handlers.GetBossLoot)
		protected.PUT("/teams/:teamId/loot/boss/:bossId/wish", handlers.UpsertItemWish)
		protected.PUT("/teams/:teamId/loot/boss/:bossId/obtained", handlers.UpdateItemObtained)
		protected.PUT("/teams/:teamId/loot/boss/:bossId/priority", handlers.UpsertBossPriority)
		protected.PUT("/teams/:teamId/loot/boss/:bossId/bonus-rolls", handlers.UpsertBonusRolls)
		protected.GET("/teams/:teamId/loot/boss/:bossId/overview", handlers.GetBossRollOverview)
		protected.GET("/teams/:teamId/loot/raid-overview", handlers.GetRaidRollOverview)
		protected.GET("/teams/:teamId/loot/items/search", handlers.SearchLootItems)
		protected.GET("/teams/:teamId/loot/items/:itemId/overview", handlers.GetItemRollOverview)
		protected.GET("/teams/:teamId/loot/audit-log", handlers.GetLootAuditLog)
		protected.GET("/teams/:teamId/loot/characters/:characterId/priorities", handlers.GetCharacterBossPriorities)
		protected.PUT("/teams/:teamId/loot/characters/:characterId/priorities", handlers.ReorderBossPriorities)
		protected.GET("/teams/:teamId/loot/tier-tracker", handlers.GetTeamTierSlots)
		protected.PUT("/teams/:teamId/loot/tier-tracker/characters/:characterId", handlers.UpsertCharacterTierSlot)
		protected.GET("/teams/:teamId/loot/tier-sim", handlers.GetTierSimData)
		protected.GET("/teams/:teamId/boe", handlers.GetBoeSales)
		protected.POST("/teams/:teamId/boe", handlers.CreateBoeSale)
		protected.PUT("/teams/:teamId/boe/:boeSaleId", handlers.UpdateBoeSale)
		protected.DELETE("/teams/:teamId/boe/:boeSaleId", handlers.DeleteBoeSale)

		// Spell endpoints
		protected.GET("/spells/search", handlers.SearchSpells)

		// Raidplan protected endpoints
		protected.GET("/me/raidplans", handlers.GetUserRaidplans)

		// News endpoints
		protected.GET("/news", handlers.GetNews)
	}

	log.Println("Server started on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
