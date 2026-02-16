package database

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"krankenprep/models"
)

var DB *gorm.DB

func Connect() {
	dsn := buildDSN()

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto-migrate all models
	if err := db.AutoMigrate(
		&models.User{},
		&models.Boss{},
		&models.Server{},
		&models.Team{},
		&models.Section{},
		&models.Note{},
		&models.Role{},
		&models.Expansion{},
		&models.Season{},
		&models.Raid{},
		&models.RaidPlan{},
		&models.InviteLink{},
		&models.Spell{},
		&models.FileData{},
	); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Enable pg_trgm and create trigram index for fuzzy spell search
	db.Exec("CREATE EXTENSION IF NOT EXISTS pg_trgm")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_spell_name_trgm ON spells USING gin (spell_name gin_trgm_ops)")

	DB = db
	log.Println("Connected to Postgres and ran migrations")
}

func buildDSN() string {
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "krankenprep")
	password := getEnv("DB_PASSWORD", "krankenprep")
	dbname := getEnv("DB_NAME", "krankenprep")
	sslmode := getEnv("DB_SSL_MODE", "disable")

	// sslmode=disable is fine for local/dev + Docker
	return fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=UTC",
		host, user, password, dbname, port, sslmode,
	)
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok && value != "" {
		log.Printf("got value %v for %v", value, key)
		return value
	}
	return fallback
}
