package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
)

var (
	GOOGLE_CLIENT_ID     string
	GOOGLE_CLIENT_SECRET string
	REDIRECT_URI         string
	scopes               = "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email"
)

type Response struct {
	Passed  bool   `json:"passed"`
	Message string `json:"message"`
}

type TokenResponse struct {
	Passed       bool   `json:"passed"`
	JWTToken     string `json:"jwtToken"`
	RefreshToken string `json:"refreshToken"`
}

func (router *Router) GoogleLoginHandler(w http.ResponseWriter, r *http.Request) {
	// Build the URL to redirect to Google's OAuth2 authorization endpoint
	authURL := fmt.Sprintf("https://accounts.google.com/o/oauth2/v2/auth?client_id=%s&redirect_uri=%s&response_type=code&scope=%s",
		url.QueryEscape(GOOGLE_CLIENT_ID), url.QueryEscape(REDIRECT_URI), url.QueryEscape(scopes))

	// Redirect the user to Google for authorization
	http.Redirect(w, r, authURL, http.StatusSeeOther)
}

func (router *Router) GoogleCallbackHandler(w http.ResponseWriter, r *http.Request) {
	// Get the authorization code from the query parameters
	code := r.URL.Query().Get("code")
	if code == "" {
		http.Error(w, "Authorization code not provided", http.StatusBadRequest)
		return
	}

	// Exchange the authorization code for an access token
	tokenResp, err := http.PostForm("https://oauth2.googleapis.com/token", url.Values{
		"client_id":     {GOOGLE_CLIENT_ID},
		"client_secret": {GOOGLE_CLIENT_SECRET},
		"redirect_uri":  {REDIRECT_URI},
		"grant_type":    {"authorization_code"},
		"code":          {code},
	})

	if err != nil {
		http.Error(w, "Failed to exchange token: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer tokenResp.Body.Close()

	body, err := io.ReadAll(tokenResp.Body)
	if err != nil {
		http.Error(w, "Failed to read response body: "+err.Error(), http.StatusInternalServerError)
		return
	}

	var tokenData map[string]interface{}
	if err := json.Unmarshal(body, &tokenData); err != nil {
		http.Error(w, "Failed to parse token response: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Extract the access token
	accessToken, ok := tokenData["access_token"].(string)
	if !ok {
		http.Error(w, "No access token found", http.StatusInternalServerError)
		return
	}

	// Use the access token to get user info
	userInfo, err := GetUserInfo(accessToken)
	if err != nil {
		http.Error(w, "Failed to get user info: "+err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, "User Info: %+v", userInfo)

}

func (router *Router) verifyToken(w http.ResponseWriter, r *http.Request) {

	// get both access and refresh token
	accessTokenCookie, err := r.Cookie("access")
	refreshTokenCookie, err := r.Cookie("refresh")

	if err != nil {
		switch {
		case errors.Is(err, http.ErrNoCookie):
			http.Error(w, "cookie not found", http.StatusBadRequest)
		default:
			log.Println(err)
			http.Error(w, "server error", http.StatusInternalServerError)
		}
		return
	}

	accessToken := accessTokenCookie.Value
	refreshToken := refreshTokenCookie.Value

	err = ValidateToken(accessToken, "access")

	// access token expired
	if err != nil {
		err = ValidateToken(refreshToken, "refresh")

		// refresh token expired
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		//generate new access token and then send it
		token, _ := GetToken(refreshToken, REFRESH_SECRET)

		fmt.Print("\nRefreshToken:\n")
		fmt.Print(token)

		userId, email := GetClaims(token)

		newJwtToken, err := CreateJWTToken(userId, email)

		if err != nil {
			fmt.Println("Error creating JWT token:", err)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(TokenResponse{true, newJwtToken, refreshToken})
	}

	w.Write([]byte("Access token is not expired"))

}

func (router *Router) LogInHandler(w http.ResponseWriter, r *http.Request) {
	sign := struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}{}

	if err := json.NewDecoder(r.Body).Decode(&sign); err != nil {
		fmt.Print(err)
		json.NewEncoder(w).Encode(Response{false, err.Error()})
		return
	}
	defer r.Body.Close()

	id, err := router.DB.DoesUserExists(sign.Email, sign.Password)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	jwtToken, err := CreateJWTToken(id, sign.Email)

	if err != nil {
		fmt.Println("Error creating JWT token:", err)
		return
	}

	// Generate refresh token
	refreshToken, err := CreateRefreshToken(id, sign.Email)

	if err != nil {
		fmt.Println("Error creating refresh token:", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(TokenResponse{true, jwtToken, refreshToken})

}

func (router *Router) SignUpHandler(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Content-Type", "application/json")

	sign := struct {
		Fname    string `json:"fname"`
		Lname    string `json:"lname"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}{}

	if err := json.NewDecoder(r.Body).Decode(&sign); err != nil {
		fmt.Print(err)
		json.NewEncoder(w).Encode(Response{false, err.Error()})
		return
	}
	defer r.Body.Close()

	emailExists, err := router.DB.EmailExistsQuery(sign.Email)

	if err != nil {
		fmt.Print(err)
		json.NewEncoder(w).Encode(Response{false, err.Error()})
		return
	}

	if emailExists {
		fmt.Print("Email already exists!!")
		json.NewEncoder(w).Encode(Response{false, "Email already exists"})
		return
	}

	if err := router.DB.SaveUserInfoQuery(sign.Lname, sign.Fname, sign.Email, sign.Password); err != nil {
		fmt.Print(err)
		json.NewEncoder(w).Encode(Response{false, "Not able to save in DB"})
		return
	}

	json.NewEncoder(w).Encode(Response{true, ""})
}
