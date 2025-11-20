package utilities

import (
	"context"
	"fmt"
	"krankenprep/database"
	"krankenprep/models"
	"log"
	"os"
	"strings"

	"github.com/descope/go-sdk/descope"
	"github.com/descope/go-sdk/descope/client"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func ExtractBattlenetLoginID(claims map[string]interface{}) (string, bool) {
	if loginIDValue, ok := claims["loginId"]; ok {

		// Try []interface{} first (most common in JSON unmarshaling)
		if loginIDSlice, ok := loginIDValue.([]interface{}); ok {
			for _, loginID := range loginIDSlice {
				// Convert each element to string
				if loginIDStr, ok := loginID.(string); ok {
					if strings.Contains(loginIDStr, "battle.net-") {
						return loginIDStr, true
					}
				}
			}
		} else if loginIDSlice, ok := loginIDValue.([]string); ok {
			// Fallback to []string if it's that type
			for _, loginID := range loginIDSlice {
				if strings.Contains(loginID, "battle.net-") {
					return loginID, true
				}
			}
		}
	} else {
		log.Println("loginId claim not found")
	}
	return "", false
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

func FetchBattlenetUserInfo(ctx *gin.Context, userToken *descope.Token) (any, bool) {
	battleNetLoginID, f := ExtractBattlenetLoginID(userToken.Claims)
	if !f {
		log.Println("Error fetching battle.net user info: Unable to find LoginId in token claims")
		return nil, false
	}
	response, _ := descopeClient.Management.User().GetProviderToken(ctx, battleNetLoginID, "Battle.Net")
	battleNetAccessToken := response.AccessToken
	userInfo, userInfoErr := GetUserInfo(battleNetAccessToken)
	GetWowProfile(battleNetAccessToken)

	return nil, false

}

func FetchOrCreateUser(c *gin.Context, userToken *descope.Token) string {
	ctx := context.Background()
	user, err := gorm.G[models.User](database.DB).Where("descope_id = ?", userToken.ID).First(ctx)
	if err.Error() == "record not found" {
		log.Printf("User with Descope ID %v does not exist", userToken.ID)
		FetchBattlenetUserInfo(c, userToken)

	}
	log.Printf("User Record Found: %v", user)

	return ""
}

func ValidateToken(c *gin.Context, token string) (bool, *descope.Token, error) {
	if descopeClient == nil {
		return false, nil, fmt.Errorf("descope client not initialized")
	}

	authorized, userToken, err := descopeClient.Auth.ValidateSessionWithToken(c, token)
	if err != nil {
		return false, nil, err
	}

	FetchOrCreateUser(c, userToken)

	return authorized, userToken, nil
}
