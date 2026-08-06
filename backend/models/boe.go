package models

import "time"

// Item slot values for BoeSale.ItemSlot — a fixed set of real WoW gear
// slots a BoE piece can drop in.
const (
	BoeSlotHead     = "Head"
	BoeSlotNeck     = "Neck"
	BoeSlotShoulder = "Shoulder"
	BoeSlotBack     = "Back"
	BoeSlotChest    = "Chest"
	BoeSlotWrist    = "Wrist"
	BoeSlotHands    = "Hands"
	BoeSlotWaist    = "Waist"
	BoeSlotLegs     = "Legs"
	BoeSlotFeet     = "Feet"
	BoeSlotFinger   = "Finger"
	BoeSlotTrinket  = "Trinket"
	BoeSlotWeapon   = "Weapon"
	BoeSlotOffHand  = "Off Hand"
)

// BoeSale is a team-scoped record of a single BoE item sale — unlike
// TierSimEntry, this is not global reference data, it's the guild's own
// financial log. GuildCut/PlayerCut are deliberately not columns: they're
// pure functions of SalePrice + SoldToPlayer (see below), computed on read
// so there's nothing that can ever drift out of sync with the split rule.
type BoeSale struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	TeamID          uint      `json:"team_id" gorm:"index"`
	Team            Team      `json:"-" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	SeasonID        uint      `json:"season_id" gorm:"index"`
	Season          Season    `json:"season" gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;"`
	PlayerName      string    `json:"player_name"`
	ItemName        string    `json:"item_name"`
	ItemSlot        string    `json:"item_slot"`
	SalePrice       float64   `json:"sale_price"`
	SoldToPlayer    bool      `json:"sold_to_player"`
	CreatedByUserID uint      `json:"created_by_user_id"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// GuildCut is 50% of the sale price, except when the item was sold directly
// to a fellow player — the guild forgoes its cut entirely so the buyer only
// pays 50% market value.
func (b BoeSale) GuildCut() float64 {
	if b.SoldToPlayer {
		return 0
	}
	return b.SalePrice * 0.5
}

// PlayerCut is always 50% of the sale price — a player-sale doesn't bump
// this to 100%, it just means the guild's would-be 50% is never collected
// by anyone.
func (b BoeSale) PlayerCut() float64 {
	return b.SalePrice * 0.5
}
