package models

import "time"

// Tier slot values for CharacterTierSlot.Slot — the 5 WoW tier-token slots.
// Deliberately its own enum, decoupled from Item.Slot (which is unconstrained
// free text scraped from Wowhead) — this tracker records which raid-difficulty
// track sourced a slot, not a specific Item row.
const (
	TierSlotHead     = "Head"
	TierSlotShoulder = "Shoulder"
	TierSlotChest    = "Chest"
	TierSlotLegs     = "Legs"
	TierSlotGloves   = "Gloves"
)

// Tier source values for CharacterTierSlot.Source. None is the default —
// explicitly stored rather than left as "no row yet" so a slot can be reset
// back to it from the UI like any other value.
const (
	TierSourceNone          = "None"
	TierSourceChampion      = "Champ"
	TierSourceVeteran       = "Vet"
	TierSourceHero          = "Hero"
	TierSourceMyth          = "Myth"
	TierSourceEmbellishment = "Embellishment"
	TierSourceInVault       = "In Vault"
)

// CharacterTierSlot is a current-snapshot record of where (or whether) a
// character got a given tier slot's piece this season — overwritten in place
// as the character's gear changes, no history kept.
type CharacterTierSlot struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	CharacterID uint      `json:"character_id" gorm:"uniqueIndex:idx_char_tier_slot"`
	Character   Character `json:"character"`
	Slot        string    `json:"slot" gorm:"uniqueIndex:idx_char_tier_slot"`
	Source      string    `json:"source"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// TierSimEntry is community theorycrafting data for a spec: the 0pc/2pc/4pc
// tier-bonus scores. All raw-diff/%-gain figures for the 0-2pc, 0-4pc, and
// 2-4pc comparisons are derived from these 3 numbers at read time rather than
// stored — the source spreadsheet's "0p ST"/"2p ST" columns repeat
// identically across comparison groups, so storing all 12 columns would just
// be redundant, driftable data.
//
// Read-only from the app's perspective: populated by hand directly in the
// database each season by the team owner, not through any in-app import UI.
//
// A spec can have more than one row per season — most specs have 2
// competitively viable hero-talent builds with meaningfully different
// numbers (e.g. Fire Mage "Sunfury" vs "Frostfire") — so the unique key
// includes BuildLabel, not just (season, spec).
type TierSimEntry struct {
	ID               uint           `json:"id" gorm:"primaryKey"`
	SeasonID         uint           `json:"season_id" gorm:"uniqueIndex:idx_season_spec_build"`
	Season           Season         `json:"season" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	SpecializationID uint           `json:"specialization_id" gorm:"uniqueIndex:idx_season_spec_build"`
	Specialization   Specialization `json:"specialization" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	BuildLabel       string         `json:"build_label" gorm:"uniqueIndex:idx_season_spec_build"`
	Score0pc         float64        `json:"score_0pc"`
	Score2pc         float64        `json:"score_2pc"`
	Score4pc         float64        `json:"score_4pc"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
}
