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
	ID        uint          `json:"id" gorm:"primaryKey"`
	SectionID uint          `json:"section_id" gorm:"index;not null"`
	Section   *Section      `json:"section,omitempty" gorm:"foreignKey:SectionID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Versions  []NoteVersion `json:"-" gorm:"foreignKey:NoteID;constraint:OnDelete:CASCADE;"`
}

type NoteVersion struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	NoteID       uint           `json:"note_id" gorm:"not null;index;uniqueIndex:uniq_note_version"`
	Version      uint           `json:"version" gorm:"not null;uniqueIndex:uniq_note_version"`
	Content      string         `json:"content" gorm:"type:text;not null"`
	ContentHash  string         `json:"content_hash" gorm:"size:64;not null;index"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	AuthorID     uint           `json:"author_id" gorm:"not null;index"`
	Author       *User          `json:"author,omitempty" gorm:"foreignKey:AuthorID;references:ID"`
	Diffs        datatypes.JSON `json:"diffs"`
	DiffStrategy string         `json:"diff_strategy"`
}

// NoteDTO is the wire representation of a Note with its latest NoteVersion flattened in.
// Note itself has no Content field — content lives in NoteVersion.
type NoteDTO struct {
	ID        uint           `json:"id"`
	SectionID uint           `json:"section_id"`
	Content   string         `json:"content"`
	Version   uint           `json:"version"`
	HasDiff   bool           `json:"has_diff"`
	Diffs     datatypes.JSON `json:"diffs,omitempty"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
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
