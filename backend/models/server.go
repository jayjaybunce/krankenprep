package models

type Server struct {
	ID       uint   `json:"id" gorm:"primaryKey"`
	Name     string `json:"name" gorm:"uniqueIndex:idx_server_name_region"`
	Region   string `json:"region" gorm:"uniqueIndex:idx_server_name_region"`
	Language string `json:"language"`
}
