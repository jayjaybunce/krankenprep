package models

import "time"

// Primary stat values shared between Specialization.PrimaryStat and
// ItemPrimaryStat.Stat — use these constants rather than literal strings to
// avoid typo mismatches between the two.
const (
	StatStrength  = "Strength"
	StatAgility   = "Agility"
	StatIntellect = "Intellect"
)

// Role values shared between Specialization.Role and ItemEligibleRole.Role.
const (
	RoleTank   = "Tank"
	RoleHealer = "Healer"
	RoleDPS    = "DPS"
)

type Class struct {
	ID              uint             `json:"id" gorm:"primaryKey"`
	Name            string           `json:"name" gorm:"uniqueIndex"`
	Color           string           `json:"color"`
	IconUrl         string           `json:"icon_url"`
	Specializations []Specialization `json:"specializations" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

// ArmorType IDs are seeded to match Blizzard's own armor subclass IDs
// (Cloth/Leather/Mail/Plate), so Item.ArmorTypeID parsed from any data
// source that follows Blizzard's numbering lines up automatically.
//
// autoIncrement:false is required here — these IDs are hand-assigned to
// match Blizzard's numbering (some of which are 0, e.g. One-Hand Axe under
// WeaponType below), and GORM otherwise treats a zero-value primary key as
// "unset" and silently omits it from the INSERT, letting Postgres generate
// a different ID than the one actually specified.
type ArmorType struct {
	ID   uint   `json:"id" gorm:"primaryKey;autoIncrement:false"`
	Name string `json:"name" gorm:"uniqueIndex"`
}

// WeaponType IDs are seeded to match Blizzard's own weapon subclass IDs
// (Sword/Axe/Mace/Dagger/Staff/...), same reasoning as ArmorType.
type WeaponType struct {
	ID   uint   `json:"id" gorm:"primaryKey;autoIncrement:false"`
	Name string `json:"name" gorm:"uniqueIndex"`
}

type Specialization struct {
	ID          uint         `json:"id" gorm:"primaryKey"`
	ClassID     uint         `json:"class_id"`
	Class       Class        `json:"class" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Name        string       `json:"name"`
	IconUrl     string       `json:"icon_url"`
	ArmorTypeID uint         `json:"armor_type_id"`
	ArmorType   ArmorType    `json:"armor_type" gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`
	PrimaryStat string       `json:"primary_stat"`
	Role        string       `json:"role"`
	WeaponTypes []WeaponType `json:"weapon_types" gorm:"many2many:specialization_weapon_types;"`
	// SheetLabel is the abbreviated "<spec> <class>" prefix this spec is
	// named with in the community tier-sim spreadsheet (e.g. "Aff Wlock"
	// for Affliction Warlock, "UH DK" for Unholy Death Knight) — a
	// spreadsheet row's full name is SheetLabel + " " + build label (e.g.
	// "Aff Wlock Soul Harvester"). Used only to match spreadsheet rows back
	// to a spec during a tier-sim refresh (see TierSimRefreshConfig); blank
	// for specs that never appear in that spreadsheet (healers/tanks-only
	// specs the sheet doesn't track).
	SheetLabel string `json:"sheet_label"`
}

// Item eligibility is computed, not stored: if ArmorTypeID is set, match it
// against a Specialization's ArmorTypeID and nothing else. Otherwise, if
// PrimaryStats has rows, a Specialization is eligible only if its
// PrimaryStat appears among them (this covers weapons, trinkets, and
// off-hand caster items). If PrimaryStats is empty and ArmorTypeID is nil,
// the item is universal (rings/necks/cloaks).
//
// EligibleRoles is an additional, independent filter that only ever applies
// to trinkets: if it has rows, a Specialization is eligible only if its
// Role appears among them, evaluated as an AND alongside the PrimaryStats
// check (e.g. a trinket tagged Tank+DPS with stats Agility+Strength is only
// eligible for specs that are both one of those roles AND one of those
// stats). Empty EligibleRoles means no role restriction.
type Item struct {
	ID            uint               `json:"id" gorm:"primaryKey"`
	WowItemID     uint               `json:"wow_item_id" gorm:"uniqueIndex"`
	Name          string             `json:"name"`
	IconUrl       string             `json:"icon_url"`
	ItemLevel     uint               `json:"item_level"`
	Quality       string             `json:"quality"`
	Slot          string             `json:"slot"`
	ArmorTypeID   *uint              `json:"armor_type_id"`
	ArmorType     *ArmorType         `json:"armor_type,omitempty" gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`
	WeaponTypeID  *uint              `json:"weapon_type_id"`
	WeaponType    *WeaponType        `json:"weapon_type,omitempty" gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`
	BossID        uint               `json:"boss_id"`
	Boss          Boss               `json:"boss" gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`
	SeasonID      uint               `json:"season_id"`
	Season        Season             `json:"season" gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`
	PrimaryStats  []ItemPrimaryStat  `json:"primary_stats" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	EligibleRoles []ItemEligibleRole `json:"eligible_roles" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	CreatedAt     time.Time          `json:"created_at"`
	UpdatedAt     time.Time          `json:"updated_at"`
}

type ItemPrimaryStat struct {
	ID     uint   `json:"id" gorm:"primaryKey"`
	ItemID uint   `json:"item_id" gorm:"uniqueIndex:idx_item_stat"`
	Stat   string `json:"stat" gorm:"uniqueIndex:idx_item_stat"`
}

type ItemEligibleRole struct {
	ID     uint   `json:"id" gorm:"primaryKey"`
	ItemID uint   `json:"item_id" gorm:"uniqueIndex:idx_item_role"`
	Role   string `json:"role" gorm:"uniqueIndex:idx_item_role"`
}

// IsEligibleFor implements the rules documented on Item above. It's a pure
// function over already-loaded data — callers must Preload PrimaryStats/
// EligibleRoles on the Item and WeaponTypes on the Specialization, since
// GORM doesn't load associations automatically.
func (i Item) IsEligibleFor(spec Specialization) bool {
	if i.ArmorTypeID != nil {
		return *i.ArmorTypeID == spec.ArmorTypeID
	}

	if i.WeaponTypeID != nil {
		if !specHasWeaponType(spec, *i.WeaponTypeID) {
			return false
		}
		return itemMatchesStat(i.PrimaryStats, spec.PrimaryStat)
	}

	// Accessory: ring/neck/cloak (never tagged, always eligible), off-hand
	// caster item (always tagged Intellect), or trinket (stat and/or role
	// tagged, both optional).
	if !itemMatchesStat(i.PrimaryStats, spec.PrimaryStat) {
		return false
	}
	return itemMatchesRole(i.EligibleRoles, spec.Role)
}

func specHasWeaponType(spec Specialization, weaponTypeID uint) bool {
	for _, wt := range spec.WeaponTypes {
		if wt.ID == weaponTypeID {
			return true
		}
	}
	return false
}

func itemMatchesStat(stats []ItemPrimaryStat, primaryStat string) bool {
	if len(stats) == 0 {
		return true
	}
	for _, s := range stats {
		if s.Stat == primaryStat {
			return true
		}
	}
	return false
}

func itemMatchesRole(roles []ItemEligibleRole, role string) bool {
	if len(roles) == 0 {
		return true
	}
	for _, r := range roles {
		if r.Role == role {
			return true
		}
	}
	return false
}

// Difficulty values shared between CharacterItemWish.Difficulty,
// CharacterBossPriority.Difficulty, and CharacterBossBonusRolls.Difficulty —
// all three are tracked separately per difficulty (a player may want
// different items, and plan/send rolls differently, in Heroic vs Mythic in
// the same week).
const (
	DifficultyHeroic = "Heroic"
	DifficultyMythic = "Mythic"
)

// CharacterItemWish records that a character wants a specific item in a
// specific difficulty, and whether it's already been obtained. Not
// season-scoped directly — an item's own SeasonID already anchors it to a
// tier.
type CharacterItemWish struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	CharacterID uint      `json:"character_id" gorm:"uniqueIndex:idx_char_item"`
	Character   Character `json:"character"`
	ItemID      uint      `json:"item_id" gorm:"uniqueIndex:idx_char_item"`
	Item        Item      `json:"item"`
	Difficulty  string    `json:"difficulty" gorm:"uniqueIndex:idx_char_item"`
	Obtained    bool      `json:"obtained"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// CharacterBossPriority records a character's self-reported priority for a
// boss (e.g. "I'm sending rolls on this boss first"), per difficulty. Only
// meaningful once the character has at least one CharacterItemWish for that
// boss — the UI enforces that, not this model.
type CharacterBossPriority struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	CharacterID uint      `json:"character_id" gorm:"uniqueIndex:idx_char_boss_priority"`
	Character   Character `json:"character"`
	BossID      uint      `json:"boss_id" gorm:"uniqueIndex:idx_char_boss_priority"`
	Boss        Boss      `json:"boss"`
	Difficulty  string    `json:"difficulty" gorm:"uniqueIndex:idx_char_boss_priority"`
	Priority    uint      `json:"priority"`
}

// CharacterBossBonusRolls is a simple manually-adjusted running total per
// difficulty — no lockout/reset concept, per the confirmed scope for this
// pass.
type CharacterBossBonusRolls struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	CharacterID uint      `json:"character_id" gorm:"uniqueIndex:idx_char_boss_rolls"`
	Character   Character `json:"character"`
	BossID      uint      `json:"boss_id" gorm:"uniqueIndex:idx_char_boss_rolls"`
	Boss        Boss      `json:"boss"`
	Difficulty  string    `json:"difficulty" gorm:"uniqueIndex:idx_char_boss_rolls"`
	Count       uint      `json:"count"`
}

// Event type values for LootAuditLog.EventType.
const (
	AuditEventItemWished       = "item_wished"
	AuditEventItemUnwished     = "item_unwished"
	AuditEventItemObtained     = "item_obtained"
	AuditEventItemUnobtained   = "item_unobtained"
	AuditEventPrioritySet      = "priority_set"
	AuditEventBonusRollAdded   = "bonus_roll_added"
	AuditEventBonusRollRemoved = "bonus_roll_removed"
)

// LootAuditLog is an immutable record of every edit made to a character's
// bonus-roll wishlist — surfaced to loot council/admin/owner as an
// accountability trail. Character/boss/item names and the acting user's
// battletag are captured as they were at the time of the action (denormalized
// snapshots, not live-joined via preload), so the log stays meaningful even
// after a character is renamed or removed later — standard audit-log
// practice, and it means the read side needs zero preload chains.
type LootAuditLog struct {
	ID             uint    `json:"id" gorm:"primaryKey"`
	TeamID         uint    `json:"team_id" gorm:"index"`
	EventType      string  `json:"event_type"`
	ActingUserID   uint    `json:"acting_user_id"`
	ActingUserBTag string  `json:"acting_user_btag"`
	CharacterID    uint    `json:"character_id" gorm:"index"`
	CharacterName  string  `json:"character_name"`
	BossID         uint    `json:"boss_id" gorm:"index"`
	BossName       string  `json:"boss_name"`
	Difficulty     string  `json:"difficulty"`
	ItemID         *uint   `json:"item_id"`
	ItemName       *string `json:"item_name"`
	// Value is the new priority (priority_set) or resulting total
	// (bonus_roll_added/bonus_roll_removed) — unused for the other event
	// types.
	Value     *uint     `json:"value"`
	CreatedAt time.Time `json:"created_at" gorm:"index"`
}
