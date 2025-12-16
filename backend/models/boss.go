package models

type Boss struct {
	ID           uint    `json:"id" gorm:"primaryKey"`
	Name         string  `json:"name" gorm:"uniqueIndex"`
	Order        int64   `json:"order"`
	Slug         string  `json:"slug"`
	Phases       []Phase `json:"phases" gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`
	SplashImgUrl string  `json:"splash_img_url"`
	IconImgUrl   string  `json:"icon_img_url"`
	RaidId       uint    `json:"raid_id"`
	Raid         Raid
}
