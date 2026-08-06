package models

// Role name values. Roles are mutually exclusive — a user holds exactly one
// per team (enforced by the uniqueIndex below, and by UpdateMemberRole
// mutating the existing row rather than creating a new one).
const (
	RoleOwner       = "owner"
	RoleAdmin       = "admin"
	RoleLootCouncil = "loot_council"
	RoleMember      = "member"
)

type Role struct {
	ID uint `json:"id" gorm:"primaryKey"`

	// FK to Team
	TeamID uint `json:"team_id" gorm:"uniqueIndex:idx_role_team_user"`
	Team   Team `json:"team"`

	// FK to User
	UserID uint `json:"user_id" gorm:"uniqueIndex:idx_role_team_user"`
	User   User `json:"user"`

	// The actual role (permissions)
	Name string `json:"name"`
}
