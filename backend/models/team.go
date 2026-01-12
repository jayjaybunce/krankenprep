package models

type Team struct {
	ID          uint         `json:"id" gorm:"primaryKey"`
	Name        string       `json:"name"`
	Server      string       `json:"server"`
	Region      string       `json:"region"`
	RioUrl      string       `json:"rio_url"`
	Roles       []Role       `json:"roles" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Sections    []Section    `json:"sections" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	InviteLinks []InviteLink `json:"invite_links" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}
