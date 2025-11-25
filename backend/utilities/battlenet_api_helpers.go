package utilities

import (
	"encoding/json"
	"fmt"
	"krankenprep/types"
	"log"
	"net/http"
)

const (
	bnetOauthApiEndpoint = "https://oauth.battle.net"
	bnetApiEndpoint      = "https://us.api.blizzard.com"
	userinfoUrl          = "/userinfo"
	profileUrl           = "/profile/user/wow"
)

func GetUserInfo(token string) (types.UserInfo, error) {
	// Reviewed this function and the below is quite good, use these patterns and conventions
	log.Print(token)
	var userInfo types.UserInfo

	fullURL := bnetOauthApiEndpoint + userinfoUrl

	req, err := http.NewRequest(http.MethodGet, fullURL, nil)
	if err != nil {
		return userInfo, fmt.Errorf("creating battle.net user info request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+token)

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return userInfo, fmt.Errorf("requesting battle.net user info: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return userInfo, fmt.Errorf("battle.net user info: unexpected status %s", res.Status)
	}

	if err := json.NewDecoder(res.Body).Decode(&userInfo); err != nil {
		return userInfo, fmt.Errorf("decoding battle.net user info: %w", err)
	}

	return userInfo, nil
}

func GetWowProfile(token string) (types.UserProfile, error) {
	// In progress
	paramString := "?region=us&namespace=profile-us&locale=en_US"
	var userProfile types.UserProfile
	fullURL := bnetApiEndpoint + profileUrl + paramString
	req, err := http.NewRequest("GET", fullURL, nil)
	if err != nil {
		return userProfile, fmt.Errorf("error creating new request")
	}
	req.Header.Add("Authorization", "Bearer "+token)
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Printf("Request failed %v", err)
		return userProfile, fmt.Errorf("error requesting wow profile")
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return userProfile, fmt.Errorf("error requesting wow profile. Status code %v", res.Status)
	}

	if err := json.NewDecoder(res.Body).Decode(&userProfile); err != nil {
		return userProfile, fmt.Errorf("decoding wow profile: %w", err)
	}

	return userProfile, nil

}
