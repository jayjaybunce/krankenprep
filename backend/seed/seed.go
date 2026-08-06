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
	expansion := MidnightData

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
		} else {
			// Keep bonus-ID fields in sync on every boot, same self-healing
			// pattern used for Classes/Specializations — these are curated
			// values that may get corrected after the season row already exists.
			if err := db.Model(&dbSeason).Updates(map[string]any{
				"heroic_bonus_ids": season.HeroicBonusIds,
				"mythic_bonus_ids": season.MythicBonusIds,
			}).Error; err != nil {
				return fmt.Errorf("failed to update season %s bonus ids: %w", season.Name, err)
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

func SeedNews(db *gorm.DB) error {
	for _, n := range NewsEntries {
		if err := db.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "title"}},
			DoNothing: true,
		}).Create(&n).Error; err != nil {
			return err
		}
	}

	return nil
}

func SeedArmorTypes(db *gorm.DB) error {
	for name, id := range armorTypeIDs {
		at := models.ArmorType{ID: id, Name: name}
		if err := db.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "id"}},
			DoNothing: true,
		}).Create(&at).Error; err != nil {
			return fmt.Errorf("seeding armor type %s: %w", name, err)
		}
	}

	return nil
}

func SeedWeaponTypes(db *gorm.DB) error {
	for name, id := range weaponTypeIDs {
		wt := models.WeaponType{ID: id, Name: name}
		if err := db.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "id"}},
			DoNothing: true,
		}).Create(&wt).Error; err != nil {
			return fmt.Errorf("seeding weapon type %s: %w", name, err)
		}
	}

	return nil
}

func SeedClasses(db *gorm.DB) error {
	for _, s := range classSeeds {
		var class models.Class
		result := db.Where("name = ?", s.Name).First(&class)
		if result.Error != nil {
			if result.Error != gorm.ErrRecordNotFound {
				return fmt.Errorf("querying class %s: %w", s.Name, result.Error)
			}
			class = models.Class{Name: s.Name, Color: s.Color, IconUrl: s.IconUrl}
			if err := db.Create(&class).Error; err != nil {
				return fmt.Errorf("seeding class %s: %w", s.Name, err)
			}
			continue
		}

		// Keep scalar fields in sync on every boot, same as SeedSpecializations.
		if err := db.Model(&class).Updates(map[string]any{
			"color":    s.Color,
			"icon_url": s.IconUrl,
		}).Error; err != nil {
			return fmt.Errorf("updating class %s: %w", s.Name, err)
		}
	}

	return nil
}

func SeedSpecializations(db *gorm.DB) error {
	for _, s := range specSeeds {
		var class models.Class
		if err := db.Where("name = ?", s.ClassName).First(&class).Error; err != nil {
			return fmt.Errorf("finding class %s for spec %s: %w", s.ClassName, s.Name, err)
		}

		var armorType models.ArmorType
		if err := db.Where("name = ?", s.ArmorType).First(&armorType).Error; err != nil {
			return fmt.Errorf("finding armor type %s for spec %s: %w", s.ArmorType, s.Name, err)
		}

		var spec models.Specialization
		result := db.Where("class_id = ? AND name = ?", class.ID, s.Name).First(&spec)
		if result.Error != nil {
			if result.Error != gorm.ErrRecordNotFound {
				return fmt.Errorf("querying spec %s: %w", s.Name, result.Error)
			}
			spec = models.Specialization{
				ClassID:     class.ID,
				Name:        s.Name,
				ArmorTypeID: armorType.ID,
				PrimaryStat: s.PrimaryStat,
				Role:        s.Role,
				IconUrl:     s.IconUrl,
			}
			if err := db.Create(&spec).Error; err != nil {
				return fmt.Errorf("creating spec %s: %w", s.Name, err)
			}
		} else {
			// Keep scalar fields in sync on every boot — this data is still
			// being actively corrected, and re-seeding shouldn't require
			// wiping the table by hand.
			spec.ArmorTypeID = armorType.ID
			spec.PrimaryStat = s.PrimaryStat
			spec.Role = s.Role
			spec.IconUrl = s.IconUrl
			if err := db.Model(&spec).Updates(map[string]any{
				"armor_type_id": spec.ArmorTypeID,
				"primary_stat":  spec.PrimaryStat,
				"role":          spec.Role,
				"icon_url":      spec.IconUrl,
			}).Error; err != nil {
				return fmt.Errorf("updating spec %s: %w", s.Name, err)
			}
		}

		var weaponTypes []models.WeaponType
		if err := db.Where("name IN ?", s.WeaponTypes).Find(&weaponTypes).Error; err != nil {
			return fmt.Errorf("finding weapon types for spec %s: %w", s.Name, err)
		}
		if err := db.Model(&spec).Association("WeaponTypes").Replace(weaponTypes); err != nil {
			return fmt.Errorf("associating weapon types for spec %s: %w", s.Name, err)
		}
	}

	return nil
}

var seeders = []SeedFunc{
	SeedServers,
	SeedExpansions,
	SeedNews,
	SeedClasses,
	SeedArmorTypes,
	SeedWeaponTypes,
	SeedSpecializations,
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
