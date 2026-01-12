package seed

import (
	"fmt"
	"krankenprep/models"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type SeedFunc func(db *gorm.DB) error

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

func SeedExpansions(db *gorm.DB) error {
	// Seed The War Within expansion data
	expansion := TheWarWithinData

	// Check if expansion exists, create if not
	var dbExpansion models.Expansion
	result := db.Where("slug = ?", expansion.Slug).First(&dbExpansion)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			if err := db.Create(&expansion).Error; err != nil {
				return fmt.Errorf("failed to create expansion: %w", err)
			}
			dbExpansion = expansion
		} else {
			return fmt.Errorf("failed to query expansion: %w", result.Error)
		}
	}

	// Seed each season
	for _, season := range expansion.Seasons {
		season.ExpansionId = dbExpansion.Id

		// Check if season exists
		var dbSeason models.Season
		result := db.Where("expansion_id = ? AND \"order\" = ?", dbExpansion.Id, season.Order).First(&dbSeason)
		if result.Error != nil {
			if result.Error == gorm.ErrRecordNotFound {
				if err := db.Create(&season).Error; err != nil {
					return fmt.Errorf("failed to create season %s: %w", season.Name, err)
				}
				dbSeason = season
			} else {
				return fmt.Errorf("failed to query season: %w", result.Error)
			}
		}

		// Seed each raid
		for _, raid := range season.Raids {
			raid.SeasonId = dbSeason.Id

			// Check if raid exists
			var dbRaid models.Raid
			result := db.Where("slug = ?", raid.Slug).First(&dbRaid)
			if result.Error != nil {
				if result.Error == gorm.ErrRecordNotFound {
					if err := db.Create(&raid).Error; err != nil {
						return fmt.Errorf("failed to create raid %s: %w", raid.Name, err)
					}
					dbRaid = raid
				} else {
					return fmt.Errorf("failed to query raid: %w", result.Error)
				}
			}

			// Seed each boss
			for _, boss := range raid.Bosses {
				boss.RaidId = dbRaid.Id

				// Check if boss exists (using name since it has uniqueIndex)
				var dbBoss models.Boss
				result := db.Where("name = ?", boss.Name).First(&dbBoss)
				if result.Error != nil {
					if result.Error == gorm.ErrRecordNotFound {
						if err := db.Create(&boss).Error; err != nil {
							return fmt.Errorf("failed to create boss %s: %w", boss.Name, err)
						}
					} else {
						return fmt.Errorf("failed to query boss: %w", result.Error)
					}
				}
			}
		}
	}

	return nil
}

var seeders = []SeedFunc{
	SeedServers,
	SeedExpansions,
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
