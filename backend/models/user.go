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
	DescopeUserId   string         `json:"descope_user_id" gorm:"uniqueIndex"`
	DescopeLoginId  string         `json:"descope_login_id" gorm:"uniqueIndex"`
	FirstLogin      bool           `json:"first_login" gorm:"type:boolean;default:true;not null"`
	BTag            string         `json:"btag"`
	BNetId          string         `json:"bnet_id"`
	BnetProfileData datatypes.JSON `json:"bnet_profile_data"`
}
