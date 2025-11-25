package middleware

import (
	"krankenprep/utilities"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authToken := c.Request.Header.Get("Authorization")
		if authToken == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing Authorization Header"})
			c.Abort()
			return
		}

		isValid, userToken, err := utilities.ValidateToken(c, authToken)
		if err != nil {
			log.Printf("Token validation error: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token validation failed"})
			c.Abort()
			return
		}

		if !isValid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Token"})
			c.Abort()
			return
		}
		log.Print(userToken)
		// Store user info in context for use in handlers
		// if userToken != nil {
		// 	c.Set("user_token", userToken)
		// }

		c.Next()
	}
}
