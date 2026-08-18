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
	TierSourceNone            = "None"
	TierSourceChampion        = "Champ"
	TierSourceVeteran         = "Vet"
	TierSourceHero            = "Hero"
	TierSourceMyth            = "Myth"
	TierSourceEmbellishment   = "Embellishment"
	TierSourceInVaultChampion = "In Vault (Champ)"
	TierSourceInVaultHero     = "In Vault (Hero)"
	TierSourceInVaultMyth     = "In Vault (Myth)"
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
// Score4pcPrevTier/Score2pcMixed/Score4pcNewTier are different: they're NOT
// derivable from the current season's own numbers, or from reusing Score4pc
// — the transition spreadsheet is run under entirely different sim settings
// than the plain 0/2/4pc spreadsheet (different fight length/target count),
// so its "new tier 4pc" figure is its own number and can land nowhere near
// Score4pc for the same spec/build. "2pc old + 2pc new" is likewise a
// genuinely different equipped-set combination with no linear relationship
// to the individual 2pc numbers. All three come from a second spreadsheet
// the team owner receives alongside the usual one, only for seasons that
// follow another season in the same expansion (nil for an expansion's first
// season, or simply not entered yet) — nil, not zero, specifically so "no
// transition data for this season" isn't confused with "a real, near-zero
// gain."
//
// Populated either by hand directly in the database, or via a team owner
// triggering a refresh (see TierSimRefreshConfig) that pulls current values
// from the community spreadsheet and only touches rows that actually
// changed.
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
	Score4pcPrevTier *float64       `json:"score_4pc_prev_tier"`
	Score2pcMixed    *float64       `json:"score_2pc_mixed"`
	Score4pcNewTier  *float64       `json:"score_4pc_new_tier"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
}

// TierSimRefreshConfig is a singleton (always exactly one row — the handler
// layer enforces this, not a DB constraint, same pattern as any other
// "there's only ever one of these" table in this codebase) pointing at the
// live community tier-sim spreadsheet, so a team owner can trigger a refresh
// without anyone hand-running SQL.
//
// The two URLs are stored exactly as pasted from the browser's address bar
// while viewing that specific tab in Google Sheets (e.g.
// ".../d/{sheetId}/edit#gid={tabId}") — the refresh handler extracts the
// sheet ID and gid out of each at request time rather than asking whoever's
// configuring this to hand-split those out themselves. This is deliberately
// "hot-swappable": updating a URL here and clicking refresh is the entire
// workflow for pointing at a new season's spreadsheet, no deploy required.
//
// TransitionSheetUrl is blank for an expansion's first season (no prior
// tier to compare against — see TierSimEntry.Score4pcPrevTier) or simply
// not entered yet; a refresh skips fetching it entirely when blank rather
// than erroring.
//
// LastRefreshedAt backs the global cooldown (enforced in the refresh
// handler, not here) and is set on any successful fetch+parse, regardless
// of whether it actually changed any rows — it does NOT get bumped on a
// hard failure (unreachable sheet, config missing), so a broken config
// doesn't burn someone's only refresh attempt for the next 20 minutes.
//
// No requester identity is stored anywhere on this — deliberately, since
// this is a global action rather than a per-team one, and logging who
// triggered it would mean persisting a player's real account identity
// (battletag-linked) for something that isn't actually sensitive enough to
// justify that.
type TierSimRefreshConfig struct {
	ID                  uint       `json:"id" gorm:"primaryKey"`
	CurrentTierSheetUrl string     `json:"current_tier_sheet_url"`
	TransitionSheetUrl  string     `json:"transition_sheet_url"`
	LastRefreshedAt     *time.Time `json:"last_refreshed_at"`
	UpdatedAt           time.Time  `json:"updated_at"`
}
