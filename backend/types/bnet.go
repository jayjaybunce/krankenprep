package types

type UserProfile struct {
	Links       Links        `json:"_links"`
	ID          int          `json:"id"`
	WowAccounts []WowAccount `json:"wow_accounts"`
	Collections HrefOnly     `json:"collections"`
}

type Links struct {
	Self    HrefOnly `json:"self"`
	User    HrefOnly `json:"user"`
	Profile HrefOnly `json:"profile"`
}

type HrefOnly struct {
	Href string `json:"href"`
}

type WowAccount struct {
	ID         int               `json:"id"`
	Characters []WowCharacterRef `json:"characters"`
}

type WowCharacterRef struct {
	Character          HrefOnly      `json:"character"`
	ProtectedCharacter HrefOnly      `json:"protected_character"`
	Name               string        `json:"name"`
	ID                 int           `json:"id"`
	Realm              Realm         `json:"realm"`
	PlayableClass      PlayableClass `json:"playable_class"`
	PlayableRace       PlayableRace  `json:"playable_race"`
	Gender             TypeNameField `json:"gender"`
	Faction            TypeNameField `json:"faction"`
	Level              int           `json:"level"`
}

type Realm struct {
	Key  HrefOnly `json:"key"`
	Name string   `json:"name"`
	ID   int      `json:"id"`
	Slug string   `json:"slug"`
}

type PlayableClass struct {
	Key  HrefOnly `json:"key"`
	Name string   `json:"name"`
	ID   int      `json:"id"`
}

type PlayableRace struct {
	Key  HrefOnly `json:"key"`
	Name string   `json:"name"`
	ID   int      `json:"id"`
}

type TypeNameField struct {
	Type string `json:"type"`
	Name string `json:"name"`
}
