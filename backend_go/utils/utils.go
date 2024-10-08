package utils

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"io"
	"math/big"
	"net/http"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var (
	JWT_SECRET     []byte
	REFRESH_SECRET []byte
)

func OtpEmailHtmlTemplate(otp string, fname string) string {

	return fmt.Sprintf(`
	<!DOCTYPE html>
		<html>
			<body>
				<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
					<div style="margin:50px auto;width:70%%;padding:20px 0">
    					<div style="border-bottom:1px solid #eee">
	 						 <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">CrowdFundX</a>
    					</div>
   						<p style="font-size:1.1em">Hi, %s</p>
   						<p>Use the following OTP to complete your Sign Up. OTP is valid for 5 minutes only.</p>
    					<h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">%s</h2>
   						<hr style="border:none;border-top:1px solid #eee" />
    					<div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      						<p>CrowdfundX</p>
   						 </div>
  					</div>
				</div>
			</body>
		</html>`, fname, otp)
}

func UploadImageToS3(ctx context.Context, s3Client *s3.Client, img []byte, bucketName, key string) error {

	imgReader := bytes.NewReader(img)

	// Upload the file
	_, err := s3Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(key),
		Body:   imgReader,
		//ACL:    types.ObjectCannedACLPublicRead, // Make the file publicly accessible
	})
	if err != nil {
		return fmt.Errorf("unable to upload %q to %q, %v", key, bucketName, err)
	}

	return nil
}

func GetPermanentURL(bucketName, region, key string) string {
	return fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, key)
}

func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

func CheckPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

func CreateJWTToken(userID int64, email string) (string, error) {
	// Create the token claims
	claims := jwt.MapClaims{
		"userId": userID,
		"email":  email,
		"exp":    time.Now().Add(time.Minute * 15).Unix(), // Token expires in 15 minutes
	}

	// Create the token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token with the secret key
	tokenString, err := token.SignedString(JWT_SECRET)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func CreateRefreshToken(userID int64, email string) (string, error) {
	// Create the token claims
	claims := jwt.MapClaims{
		"userId": userID,
		"email":  email,
		"exp":    time.Now().Add(time.Hour * 24 * 7).Unix(), // Refresh token expires in 7 days
	}

	// Create the token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token with the secret key
	tokenString, err := token.SignedString(REFRESH_SECRET)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func GetToken(tokenString string, secret []byte) (*jwt.Token, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return secret, nil
	})

	if err != nil {
		fmt.Print("\nGetToken: ", err)
		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return token, nil
}

func ValidateToken(tokenString string, tokenType string) error {
	secret := JWT_SECRET

	if tokenType == "refresh" {
		secret = REFRESH_SECRET
	}

	token, err := GetToken(tokenString, secret)
	if err != nil {
		fmt.Print("\nToken Invalid\n")
		return err
	}

	//Check for expiry
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if exp, ok := claims["exp"].(int64); ok {
			if time.Unix(exp, 0).Before(time.Now()) {
				return fmt.Errorf("Token has expired")
			}

		}
	} else {
		return fmt.Errorf("Invalid token")
	}

	return nil
}

func GetClaims(token *jwt.Token) (int64, string) {

	claims := token.Claims.(jwt.MapClaims)
	return int64(claims["userId"].(float64)), claims["email"].(string)
}

func GetUserInfo(googleAccessToken string) (map[string]interface{}, error) {
	req, err := http.NewRequest("GET", "https://www.googleapis.com/oauth2/v2/userinfo", nil)
	if err != nil {
		return nil, err
	}

	// Set the Authorization header with the access token
	req.Header.Set("Authorization", "Bearer "+googleAccessToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var userInfo map[string]interface{}
	if err := json.Unmarshal(body, &userInfo); err != nil {
		return nil, err
	}

	return userInfo, nil
}

func EnableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "*")
	(*w).Header().Set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
}

func GenerateCustomID() string {
	currentTime := time.Now().UnixNano()
	randomNumber, _ := rand.Int(rand.Reader, big.NewInt(100000))
	return fmt.Sprintf("%d-%d", currentTime, randomNumber)
}

func GenerateOTP() string {

	n, _ := rand.Int(rand.Reader, big.NewInt(9000))

	otp := int(n.Int64()) + 1000
	otpStr := fmt.Sprintf("%04d", otp)
	return otpStr
}
