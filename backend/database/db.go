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
	if err := db.AutoMigrate(&models.User{}, &models.Boss{}, &models.Server{}, &models.Team{}, &models.Phase{}, &models.PhaseSection{}, &models.SectionContent{}, &models.Role{}); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	DB = db
	log.Println("Connected to Postgres and ran migrations")
}

func buildDSN() string {
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "krankenprep")
	password := getEnv("DB_PASSWORD", "krankenprep")
	dbname := getEnv("DB_NAME", "krankenprep")

	// sslmode=disable is fine for local/dev + Docker
	return fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		host, user, password, dbname, port,
	)
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok && value != "" {
		return value
	}
	return fallback
}
