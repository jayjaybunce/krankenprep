package models

import (
	"time"
)

type InviteLink struct {
	ID              uint       `json:"id"`
	TeamId          uint       `json:"team_id"`
	Team            Team       `json:"team"`
	TokenHash       string     `json:"token_hash"`
	CreatedByUserId uint       `json:"created_by_user_id"`
	CreatedByUser   User       `json:"created_by_user"`
	ExpiresAt       time.Time  `json:"expires_at"`
	RevokedAt       *time.Time `json:"revoked_at"`
	CreatedAt       time.Time  `json:"created_at"`
	MaxUses         int        `json:"max_uses"`
	Uses            int        `json:"uses"`
}
