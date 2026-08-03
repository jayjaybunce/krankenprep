package models

import "time"

type News struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title" gorm:"uniqueIndex"`
	Body        string    `json:"body"`
	PublishedAt time.Time `json:"published_at"`
}
