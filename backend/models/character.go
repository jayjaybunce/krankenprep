package models

import "time"

type Character struct {
	ID               uint            `json:"id" gorm:"primaryKey"`
	PlayerID         uint            `json:"player_id"`
	Player           Player          `json:"player"`
	Name             string          `json:"name"`
	Class            string          `json:"class"`
	Realm            string          `json:"realm"`
	Region           string          `json:"region"`
	IsMain           bool            `json:"is_main"`
	SpecializationID *uint           `json:"specialization_id"`
	Specialization   *Specialization `json:"specialization,omitempty" gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
	CreatedAt        time.Time       `json:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at"`
}
