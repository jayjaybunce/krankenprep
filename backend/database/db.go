package database

import (
	"fmt"
	"log"
	"os"
	"time"

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

	// Without this, database/sql's default of 2 idle connections meant most
	// requests paid a fresh TCP+TLS+pooler handshake to Neon instead of
	// reusing a warm connection — a single request like GetTeamById issues
	// ~9 sequential queries (one per Preload path), so that default alone
	// could account for several seconds of latency per request. MaxIdleConns
	// matches MaxOpenConns so connections opened during a request's burst of
	// queries stay pooled for the next request rather than being closed.
	// ConnMaxIdleTime is kept well under Neon's pooler-side idle timeout so
	// the app proactively recycles a connection instead of discovering a
	// half-dead one returned from the pool.
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("Failed to get underlying sql.DB: %v", err)
	}
	sqlDB.SetMaxOpenConns(10)
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetConnMaxIdleTime(5 * time.Minute)
	sqlDB.SetConnMaxLifetime(30 * time.Minute)

	// Auto-migrate all models
	if err := db.AutoMigrate(
		&models.User{},
		&models.Boss{},
		&models.Server{},
		&models.Team{},
		&models.Section{},
		&models.Note{},
		&models.NoteVersion{},
		&models.Role{},
		&models.Player{},
		&models.Character{},
		&models.Expansion{},
		&models.Season{},
		&models.Raid{},
		&models.RaidPlan{},
		&models.InviteLink{},
		&models.Spell{},
		&models.FileData{},
		&models.Wishlist{},
		&models.AssignmentNote{},
		&models.News{},
		&models.Class{},
		&models.ArmorType{},
		&models.WeaponType{},
		&models.Specialization{},
		&models.Item{},
		&models.ItemPrimaryStat{},
		&models.ItemEligibleRole{},
		&models.CharacterItemWish{},
		&models.CharacterBossPriority{},
		&models.CharacterBossBonusRolls{},
		&models.LootAuditLog{},
		&models.CharacterTierSlot{},
		&models.TierSimEntry{},
		&models.TierSimRefreshConfig{},
		&models.BoeSale{},
	); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Enable pg_trgm and create trigram index for fuzzy spell search
	db.Exec("CREATE EXTENSION IF NOT EXISTS pg_trgm")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_spell_name_trgm ON spells USING gin (spell_name gin_trgm_ops)")

	fixDifficultyUniqueIndexes(db)

	DB = db
	log.Println("Connected to Postgres and ran migrations")
}

// fixDifficultyUniqueIndexes re-creates the composite unique indexes on
// CharacterItemWish/CharacterBossPriority/CharacterBossBonusRolls with their
// current column set. AutoMigrate adds new columns (e.g. the Difficulty
// field added after these indexes already existed) but never redefines an
// already-existing index to include them, so the old 2-column index sticks
// around and rejects the 3-column ON CONFLICT clauses/uniqueness these
// models now rely on. Safe to run on every boot.
func fixDifficultyUniqueIndexes(db *gorm.DB) {
	indexes := []struct {
		name    string
		table   string
		columns string
	}{
		{"idx_char_item", "character_item_wishes", "character_id, item_id, difficulty"},
		{"idx_char_boss_priority", "character_boss_priorities", "character_id, boss_id, difficulty"},
		{"idx_char_boss_rolls", "character_boss_bonus_rolls", "character_id, boss_id, difficulty"},
	}
	for _, idx := range indexes {
		if err := db.Exec(fmt.Sprintf("DROP INDEX IF EXISTS %s", idx.name)).Error; err != nil {
			log.Printf("failed to drop index %s: %v", idx.name, err)
			continue
		}
		if err := db.Exec(fmt.Sprintf(
			"CREATE UNIQUE INDEX IF NOT EXISTS %s ON %s (%s)", idx.name, idx.table, idx.columns,
		)).Error; err != nil {
			log.Printf("failed to create index %s: %v", idx.name, err)
		}
	}
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
