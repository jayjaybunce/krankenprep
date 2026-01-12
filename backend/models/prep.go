package models

import (
	"time"

	"gorm.io/datatypes"
)

type Section struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Variant     string    `json:"variant"`
	Tags        string    `json:"tags"`
	TeamID      uint      `json:"team_id"`
	Team        Team      `json:"team" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	BossID      uint      `json:"boss_id"`
	Boss        Boss      `json:"boss" gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`
	Notes       []Note    `json:"notes" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Note struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	SectionID uint      `json:"section_id"`
	Section   Section   `json:"section" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Content   string    `json:"content" gorm:"type:text"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type RaidPlan struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	ShareID   string         `json:"share_id" gorm:"uniqueIndex;type:varchar(255)"`
	EditID    string         `json:"edit_id" gorm:"uniqueIndex;type:varchar(512)"`
	Sequence  string         `json:"sequence"`
	Content   datatypes.JSON `json:"content"`
	Name      string         `json:"name"`
	UserID    *uint          `json:"user_id"`
	Boss      string         `json:"boss"`
	Raid      string         `json:"raid"`
	User      User           `json:"user" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	SectionID *uint          `json:"section_id" gorm:"uniqueIndex"`
	Section   Section        `json:"section" gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
}
