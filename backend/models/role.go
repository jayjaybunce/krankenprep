package models

type Role struct {
	ID uint `json:"id" gorm:"primaryKey"`

	// FK to Team
	TeamID uint `json:"team_id"`
	Team   Team `json:"team"`

	// FK to User
	UserID uint `json:"user_id"`
	User   User `json:"user"`

	// The actual role (permissions)
	Name string `json:"name"`
}
