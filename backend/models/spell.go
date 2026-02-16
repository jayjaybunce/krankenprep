package models

type Spell struct {
	SpellID    int      `json:"spell_id" gorm:"primaryKey"`
	SpellName  string   `json:"spell_name"`
	FileDataID *int      `json:"file_data_id"`
	FileData   *FileData `json:"file_data" gorm:"-"`
}

type FileData struct {
	FileDataID int    `json:"file_data_id" gorm:"primaryKey"`
	Filename   string `json:"filename"`
}

// SpellName
// -------------
// ID
// Name_lang
//
//
// SpellMisc
// -------------
// SpellID
// SpellIconFileDataID
//
//
//
//
//
//
//
//
