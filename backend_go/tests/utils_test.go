package tests

import (
	"backend/utils"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func TestCreateRefreshToken(t *testing.T) {
	userID := int64(123)
	email := "test@example.com"
	utils.REFRESH_SECRET = []byte("secret")

	token, err := utils.CreateRefreshToken(userID, email)

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if token == "" {
		t.Fatalf("Expected token, got empty string")
	}

}

func TestValidateToken(t *testing.T) {
	utils.JWT_SECRET = []byte("access_secret")
	utils.REFRESH_SECRET = []byte("refresh_secret")

	validAccessToken, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId": 123,
		"email":  "test@example.com",
		"exp":    time.Now().Add(time.Hour).Unix(),
	}).SignedString(utils.JWT_SECRET)

	validRefreshToken, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId": 123,
		"email":  "test@example.com",
		"exp":    time.Now().Add(time.Hour).Unix(),
	}).SignedString(utils.REFRESH_SECRET)

	expiredToken, _ := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId": 123,
		"email":  "test@example.com",
		"exp":    time.Now().Add(-time.Hour).Unix(),
	}).SignedString(utils.JWT_SECRET)

	testCases := []struct {
		name          string
		tokenString   string
		tokenType     string
		expectedError bool
		expectedMsg   string
	}{
		{
			name:          "ValidAccessToken",
			tokenString:   validAccessToken,
			tokenType:     "access",
			expectedError: false,
		},
		{
			name:          "ValidRefreshToken",
			tokenString:   validRefreshToken,
			tokenType:     "refresh",
			expectedError: false,
		},
		{
			name:          "ExpiredToken",
			tokenString:   expiredToken,
			tokenType:     "access",
			expectedError: true,
			expectedMsg:   "token has invalid claims: token is expired",
		},
		{
			name:          "InvalidTokenType",
			tokenString:   validAccessToken,
			tokenType:     "refresh",
			expectedError: true,
		},
		{
			name:          "MalformedToken",
			tokenString:   "malformedtoken",
			tokenType:     "access",
			expectedError: true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			err := utils.ValidateToken(tc.tokenString, tc.tokenType)

			if tc.expectedError && err == nil {
				t.Fatalf("Expected error, got nil")
			}

			if !tc.expectedError && err != nil {
				t.Fatalf("Expected no error, got %v", err)
			}

			if tc.expectedError && err != nil && tc.expectedMsg != "" && err.Error() != tc.expectedMsg {
				t.Fatalf("Expected error message '%s', got '%s'", tc.expectedMsg, err.Error())
			}
		})
	}
}
