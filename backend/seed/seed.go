package seed

import (
	"fmt"
	"krankenprep/models"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type SeedFunc func(db *gorm.DB) error

// SeedServers inserts server records, ignoring duplicates on (name, region).

var serverGroups = [][]models.Server{
	NaServers,
	EuServers,
}

func SeedServers(db *gorm.DB) error {
	for _, group := range serverGroups {
		for _, s := range group {
			if err := db.Clauses(clause.OnConflict{
				Columns:   []clause.Column{{Name: "name"}, {Name: "region"}},
				DoNothing: true,
			}).Create(&s).Error; err != nil {
				return err
			}
		}
	}

	return nil
}

var seeders = []SeedFunc{
	SeedServers,
}

// RunSeeders runs all registered seed functions in order.
func RunSeeders(db *gorm.DB) error {
	for i, s := range seeders {
		if err := s(db); err != nil {
			return fmt.Errorf("seeder %d failed: %w", i, err)
		}
	}
	return nil
}
