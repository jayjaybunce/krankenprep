package models

type Team struct {
	ID     uint    `json:"id" gorm:"primaryKey"`
	Name   string  `json:"name"`
	Server string  `json:"server"`
	Region string  `json:"region"`
	RioUrl string  `json:"rio_url"`
	Roles  []Role  `json:"roles" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Phases []Phase `json:"phases" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

type Phase struct {
	ID       uint           `json:"id" gorm:"primaryKey"`
	Name     string         `json:"name"`
	BossID   uint           `json:"boss_id"`
	Boss     Boss           `json:"boss" gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`
	TeamID   uint           `json:"team_id"`
	Team     Team           `json:"team" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Variant  string         `json:"variant"`
	Sections []PhaseSection `json:"sections" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

type PhaseSection struct {
	ID       uint             `json:"id" gorm:"primaryKey"`
	Variant  string           `json:"variant"`
	PhaseID  uint             `json:"phase_id"`
	Phase    Phase            `json:"phase" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Contents []SectionContent `json:"contents" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

type SectionContent struct {
	ID             uint         `json:"id" gorm:"primaryKey"`
	PhaseSectionID uint         `json:"phase_section_id"`
	PhaseSection   PhaseSection `json:"-" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Type           string       `json:"type"`    // e.g. "text", "image", "link"
	URL            string       `json:"url"`     // note: capital URL, still maps to "url"
	Value          string       `json:"value"`   // raw content / text / embed
	Caption        string       `json:"caption"` // optional label
}
