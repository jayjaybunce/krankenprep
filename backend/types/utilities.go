package types

type BattleNetUserData struct {
	Battletag      string
	BlizzardUserID int64
	WowProfileData UserProfile
}

type UserData struct {
	BattleTag      string
	BlizzardUserID string
	WowProfileData UserProfile
	DescopeUserId  string
	DescopeLoginId string
	BnetId         string
}
