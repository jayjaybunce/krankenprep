package models

import "time"

type Team struct {
	ID                   uint             `json:"id" gorm:"primaryKey"`
	Name                 string           `json:"name"`
	Server               string           `json:"server"`
	Region               string           `json:"region"`
	RioUrl               string           `json:"rio_url"`
	WowAuditIntegration  bool             `json:"wowaudit_integration"`
	WoWAuditDataSyncDate time.Time        `json:"wowaudit_data_synced_at"`
	WowAuditUrl          string           `json:"wowaudit_url"`
	WowAuditApiKey       string           `json:"wowaudit_api_key"`
	WowUtilsIntegration  bool             `json:"wowutils_integration"`
	WowUtilsGroupId      string           `json:"wowutils_group_id"`
	Roles                []Role           `json:"roles" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Players              []Player         `json:"players" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Sections             []Section        `json:"sections" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	InviteLinks          []InviteLink     `json:"invite_links" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	WishlistConfigs      []Wishlist       `json:"wishlist_configs" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	AssignmentNotes      []AssignmentNote `json:"assignment_notes" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	CreatedAt            time.Time        `json:"created_at"`
	UpdatedAt            time.Time        `json:"updated_at"`

	// WowUtilsApiKey is deliberately excluded from JSON — WowUtils only ever
	// shows this key once at creation on their end, so we don't round-trip
	// it back to the client the way WowAuditApiKey currently is. Handlers
	// that return a Team should set WowUtilsApiKeySet explicitly beforehand
	// so the settings UI can render "already configured" without ever
	// seeing the real key back.
	WowUtilsApiKey    string `json:"-"`
	WowUtilsApiKeySet bool   `json:"wowutils_api_key_set" gorm:"-"`
}

type Wishlist struct {
	ID                     uint   `json:"id" gorm:"primaryKey"`
	WowAuditID             uint   `json:"wowaudit_id" gorm:"unique"`
	Name                   string `json:"name"`
	Description            string `json:"description"`
	FightStyle             string `json:"fight_style"`
	NumberOfBosses         uint   `json:"number_of_bosses"`
	FightDuration          uint   `json:"fight_duration"`
	Sockets                bool   `json:"sockets"`
	Pi                     bool   `json:"pi"`
	ExpertMode             bool   `json:"expert_mode"`
	MatchEquippedGear      bool   `json:"match_equipped_gear"`
	UpgradeLevel           uint   `json:"upgrade_level"`
	UpgradeLevelMythic     uint   `json:"upgrade_level_mythic"`
	UpgradeLevelHeroic     uint   `json:"upgrade_level_heroic"`
	UpgradeLevelNormal     uint   `json:"upgrade_level_normal"`
	UpgradeLevelLfr        uint   `json:"upgrade_level_lfr"`
	UpgradeLevelRaidFinder uint   `json:"upgrade_level_raid_finder"`
	Team                   Team   `json:"team"`
	TeamID                 uint   `json:"team_id"`
}

type AssignmentNote struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Note      string    `json:"note"`
	Boss      Boss      `json:"boss"`
	BossID    uint      `json:"boss_id"`
	Team      Team      `json:"team"`
	TeamID    uint      `json:"team_id"`
	UpdatedAt time.Time `json:"updated_at"`
}
