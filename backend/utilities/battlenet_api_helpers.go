package utilities

import (
	"encoding/json"
	"io"
	"krankenprep/types"
	"log"
	"net/http"
)

const (
	bnetOauthApiEndpoint = "https://oauth.battle.net"
	bnetApiEndpoint      = "https://us.api.blizzard.com/profile/user/wow"
	userinfo             = "/userinfo"
)

type UserInfo struct {
	Sub       string
	Id        int64
	Battletag string
}

func GetUserInfo(token string) (UserInfo, bool) {
	var userInfo UserInfo

	fullUrl := bnetOauthApiEndpoint + userinfo
	req, err := http.NewRequest("GET", fullUrl, nil)
	if err != nil {
		log.Printf("New request failed with error: %v", err)
		return userInfo, false
	}
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Printf("Request failed: %v", err)
		return userInfo, false
	}
	defer res.Body.Close()

	body, _ := io.ReadAll(res.Body)

	decode_error := json.Unmarshal(body, &userInfo)
	if decode_error != nil {
		log.Printf("Error decoding user info from /userinfo")
	}
	log.Println("Decoded user info")
	return userInfo, true

}

func GetWowProfile(token string) nil {
	// In progress
	var wowProfile types.UserProfile
	return nil

}
