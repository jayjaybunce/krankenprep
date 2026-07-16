package models

import "time"

type Player struct {
	ID         uint        `json:"id" gorm:"primaryKey"`
	TeamID     uint        `json:"team_id"`
	Team       Team        `json:"team"`
	UserID     *uint       `json:"user_id"`
	User       *User       `json:"user"`
	Name       string      `json:"name"`
	Battletag  string      `json:"battletag"`
	Characters []Character `json:"characters" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	CreatedAt  time.Time   `json:"created_at"`
	UpdatedAt  time.Time   `json:"updated_at"`
}
