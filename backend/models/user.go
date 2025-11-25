package models

import (
	"time"

	"gorm.io/datatypes"
)

type User struct {
	ID              uint           `json:"id" gorm:"primaryKey"`
	Email           string         `json:"email"`
	Name            string         `json:"name"`
	CreatedAt       time.Time      `json:"created_at"`
	DescopeUserId   string         `json:"-" gorm:"uniqueIndex"`
	DescopeLoginId  string         `json:"-" gorm:"uniqueIndex"`
	FirstLogin      bool           `json:"first_login" gorm:"type:boolean;default:true;not null"`
	BTag            string         `json:"btag"`
	BNetId          int64          `json:"-"`
	BnetProfileData datatypes.JSON `json:"bnet_profile_data"`
	Roles           []Role         `json:"roles"`
}
