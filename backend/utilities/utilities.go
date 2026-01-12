package utilities

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"krankenprep/database"
	"krankenprep/models"
	"krankenprep/types"
	"log"
	"os"
	"strings"

	"github.com/descope/go-sdk/descope"
	"github.com/descope/go-sdk/descope/client"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func ExtractBattlenetLoginID(claims map[string]interface{}) (string, error) {
	if loginIDValue, ok := claims["loginId"]; ok {
		// Try []interface{} first (most common in JSON unmarshaling)
		if loginIDSlice, ok := loginIDValue.([]interface{}); ok {
			for _, loginID := range loginIDSlice {
				// Convert each element to string
				if loginIDStr, ok := loginID.(string); ok {
					if strings.Contains(loginIDStr, "battle.net-") {
						return loginIDStr, nil
					}
				}
			}
		} else if loginIDSlice, ok := loginIDValue.([]string); ok {
			// Fallback to []string if it's that type
			for _, loginID := range loginIDSlice {
				if strings.Contains(loginID, "battle.net-") {
					return loginID, nil
				}
			}
		}
	}
	return "", fmt.Errorf("error extracting battle.net login id from token claims")
}

var descopeClient *client.DescopeClient

func InitDescopeClient() error {
	projectID := os.Getenv("DESCOPE_PROJECT_ID")
	managementKey := os.Getenv("DESCOPE_MANAGEMENT_KEY")
	if projectID == "" {
		return fmt.Errorf("DESCOPE_PROJECT_ID environment variable not set")
	}
	if managementKey == "" {
		return fmt.Errorf("DESCOPE_MANAGEMENT_KEY environment variable not set")
	}
	var err error
	descopeClient, err = client.NewWithConfig(&client.Config{ProjectID: projectID, ManagementKey: managementKey})
	return err
}

func GetDescopeClient() (*client.DescopeClient, error) {
	if descopeClient == nil {
		return nil, fmt.Errorf("descope client not initialized")
	}
	return descopeClient, nil
}

func FetchBattleNetAccessToken(ctx *gin.Context, userToken *descope.Token) (string, error) {
	battleNetLoginID, err := ExtractBattlenetLoginID(userToken.Claims)
	if err != nil {
		return "", fmt.Errorf("extracting Bnet ID from token %w", err)
	}
	response, err := descopeClient.Management.User().GetProviderToken(ctx, battleNetLoginID, "Battle.Net")
	if err != nil {
		return "", fmt.Errorf("retrieving bnet provider token from descope %w", err)
	}
	return response.AccessToken, nil

}

func FetchBattlenetUserInfo(ctx *gin.Context, userToken *descope.Token) (types.BattleNetUserData, error) {
	var bnetUserData types.BattleNetUserData
	battleNetAccessToken, err := FetchBattleNetAccessToken(ctx, userToken)
	if err != nil {
		return bnetUserData, fmt.Errorf("error fetching battle.net access token")
	}
	userInfo, info_err := GetUserInfo(battleNetAccessToken)
	userProfile, _ := GetWowProfile(battleNetAccessToken)
	if info_err != nil {
		return bnetUserData, fmt.Errorf("error getting user info %w", info_err)
	}
	// if profile_err != nil {
	// 	return bnetUserData, fmt.Errorf("error getting wow profile %w", profile_err)
	// }
	bnetUserData = types.BattleNetUserData{
		Battletag:      userInfo.Battletag,
		BlizzardUserID: userInfo.Id,
		WowProfileData: userProfile,
	}
	return bnetUserData, nil
}

func FetchUser(c *gin.Context, userToken *descope.Token) (models.User, error) {
	ctx := context.Background()
	user, err := gorm.G[models.User](database.DB).Where("descope_user_id = ?", userToken.ID).First(ctx)
	if err != nil {
		if err.Error() == "record not found" {
			return user, fmt.Errorf("retrieving user: %w", err)
		}

	}
	return user, nil
}

func CreateUser(c *gin.Context, userToken *descope.Token) (models.User, error) {
	ctx := context.Background()

	var user models.User
	bnetUserData, err := FetchBattlenetUserInfo(c, userToken)
	// We don't really need all the Bnet info, create the user even if it fails
	if err != nil {
		return user, fmt.Errorf("creating user: %w", err)
	}

	descopeUserId := userToken.ID
	descopeLoginId, _ := ExtractBattlenetLoginID(userToken.Claims)

	wowProfileData, err := json.Marshal(bnetUserData.WowProfileData)
	if err != nil {
		return user, fmt.Errorf("converting wow profile data to json: %w", wowProfileData)
	}

	user = models.User{BTag: bnetUserData.Battletag, BNetId: bnetUserData.BlizzardUserID, DescopeUserId: descopeUserId, DescopeLoginId: descopeLoginId, FirstLogin: true, BnetProfileData: wowProfileData}

	result := gorm.WithResult()
	create_err := gorm.G[models.User](database.DB, result).Create(ctx, &user)
	if create_err != nil {
		return user, fmt.Errorf("creating new user record: %w", create_err)
	}
	return user, nil
}

func ValidateToken(c *gin.Context, token string) (bool, *descope.Token, error) {

	if descopeClient == nil {
		return false, nil, fmt.Errorf("descope client not initialized")
	}

	authorized, userToken, tokenErr := descopeClient.Auth.ValidateSessionWithToken(c, token)
	if tokenErr != nil {
		return false, nil, tokenErr
	}
	log.Printf("Authorized: %v UserToken: %v TokenErr: %v", authorized, userToken, tokenErr)

	createdUser, fetchUserErr := FetchUser(c, userToken)
	if fetchUserErr == nil {
		c.Set("user", &createdUser)
		return authorized, userToken, nil
	} else {
		createdUser, createUserErr := CreateUser(c, userToken)
		if createUserErr != nil {
			return authorized, userToken, fmt.Errorf("creating user :%w", createUserErr)
		}
		c.Set("user", &createdUser)
	}
	return authorized, userToken, nil
}

// GenerateRaidPlanIDs generates a share ID and edit ID for a raid plan
// The share ID is a short random string (e.g., "jth3j4w7zfx6svhu")
// The edit ID is the share ID plus a longer random string (e.g., "jth3j4w7zfx6svhu/DVVEFH15GfNCnyFmm6kz6a_6BcMi59l4")
func GenerateRaidPlanIDs() (shareID string, editID string, err error) {
	// Generate share ID (12 bytes = 16 characters base64url)
	shareBytes := make([]byte, 12)
	if _, err := rand.Read(shareBytes); err != nil {
		return "", "", fmt.Errorf("generating share ID: %w", err)
	}
	shareID = base64.RawURLEncoding.EncodeToString(shareBytes)

	// Generate edit token (24 bytes = 32 characters base64url)
	editBytes := make([]byte, 24)
	if _, err := rand.Read(editBytes); err != nil {
		return "", "", fmt.Errorf("generating edit token: %w", err)
	}
	editToken := base64.RawURLEncoding.EncodeToString(editBytes)

	// Combine share ID and edit token
	editID = shareID + editToken

	return shareID, editID, nil
}
