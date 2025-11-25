package models

type Boss struct {
	ID          uint    `json:"id" gorm:"primaryKey"`
	Name        string  `json:"name" gorm:"uniqueIndex"`
	Expansion   string  `json:"expansion"`
	EncounterId int64   `json:"encounter_id"`
	Current     bool    `json:"current"`
	Phases      []Phase `json:"phases" gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`
}
