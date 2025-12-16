package models

import (
	"time"
)

type Expansion struct {
	Id        uint     `json:"id" gorm:"primary_key"`
	Name      string   `json:"name"`
	IsCurrent bool     `json:"is_current"`
	Slug      string   `json:"slug"`
	Seasons   []Season `json:"seasons"`
}

type Raid struct {
	Id           uint   `json:"id" gorm:"primary_key"`
	Name         string `json:"name"`
	Slug         string `json:"slug"`
	Order        uint   `json:"order"`
	Expansion    string `json:"expansion"`
	SplashImgUrl string `json:"splash_img_url"`
	SeasonId     uint   `json:"season_id"`
	Season       Season `json:"season"`
	Bosses       []Boss `json:"bosses"`
}

type Season struct {
	Id          uint      `json:"id" gorm:"primary_key"`
	StartDate   time.Time `json:"start_date"`
	EndDate     time.Time `json:"end_date"`
	Name        string    `json:"name"`
	Raids       []Raid    `json:"raids"`
	Order       uint      `json:"order"`
	IsCurrent   bool      `json:"is_current"`
	ExpansionId uint      `json:"expansion_id"`
	Expansion   Expansion `json:"expansion"`
}
