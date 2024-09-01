package handlers

import (
	"backend/utils"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Database struct {
	Pool *pgxpool.Pool
}

type Router struct {
	DB *Database
}

func VerifyToken(w http.ResponseWriter, r *http.Request) {

	// get both access and refresh token
	accessTokenCookie, err := r.Cookie("access")

	if err != nil {
		if errors.Is(err, http.ErrNoCookie) {
			fmt.Println("Access token cookie not found:")
			http.Error(w, "Access token cookie not found", http.StatusBadRequest)
		} else {
			fmt.Println("Error retrieving access token cookie:", err)
			http.Error(w, "Server error", http.StatusInternalServerError)
		}
		return
	}

	refreshTokenCookie, err := r.Cookie("refresh")

	if err != nil {
		if errors.Is(err, http.ErrNoCookie) {
			fmt.Println("Refresh token cookie not found:")
			http.Error(w, "Refresh token cookie not found", http.StatusBadRequest)
		} else {
			fmt.Println("Error retrieving refresh token cookie:", err)
			http.Error(w, "Server error", http.StatusInternalServerError)
		}
		return
	}

	accessToken := accessTokenCookie.Value
	refreshToken := refreshTokenCookie.Value

	if (accessToken == "") && (refreshToken == "") {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Access and refresh tokens are missing"))
		return
	}

	err = utils.ValidateToken(accessToken, "access")

	// access token expired
	if err != nil {
		fmt.Println(err)
		err = utils.ValidateToken(refreshToken, "refresh")

		// refresh token expired
		if err != nil {
			fmt.Println(err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		//generate new access token and then send it
		token, err := utils.GetToken(refreshToken, utils.REFRESH_SECRET)

		if err != nil {
			fmt.Println(err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		userId, email := utils.GetClaims(token)
		newJwtToken, err := utils.CreateJWTToken(userId, email)

		if err != nil {
			fmt.Println("Error creating JWT token:", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "access",
			Value:    newJwtToken,
			Path:     "/",
			Expires:  time.Now().Add(15 * time.Minute),
			MaxAge:   900,
			HttpOnly: true,
			// Secure:   true,
			// SameSite: http.SameSiteNoneMode,
		})
		w.Write([]byte(strconv.Itoa(int(userId))))

		return

	}

	token, err := utils.GetToken(accessToken, utils.JWT_SECRET)

	if err != nil {
		fmt.Println("Error getting token from access token:", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	id, _ := utils.GetClaims(token)
	w.Write([]byte(strconv.Itoa(int(id))))

}

func (router *Router) LogInHandler(w http.ResponseWriter, r *http.Request) {

	sign := struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}{}

	if err := json.NewDecoder(r.Body).Decode(&sign); err != nil {
		fmt.Print(err)
		//json.NewEncoder(w).Encode(Response{false, err.Error()})
		http.Error(w, "Decoding failed", http.StatusInternalServerError)
		return
	}
	defer r.Body.Close()

	id, err := router.DB.DoesUserExists(sign.Email, sign.Password)

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	jwtToken, err := utils.CreateJWTToken(id, sign.Email)

	if err != nil {
		fmt.Println("Error creating JWT token:", err)
		http.Error(w, "Error creating JWT token", http.StatusInternalServerError)
		return
	}

	// Generate refresh token
	refreshToken, err := utils.CreateRefreshToken(id, sign.Email)

	if err != nil {
		fmt.Println("Error creating refresh token:", err)
		http.Error(w, "Error creating refresh token", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "access",
		Value:    jwtToken,
		Path:     "/",
		Expires:  time.Now().Add(15 * time.Minute),
		MaxAge:   900,
		HttpOnly: true,
		// Secure:   true,
		// SameSite: http.SameSiteNoneMode,
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh",
		Value:    refreshToken,
		Path:     "/",
		Expires:  time.Now().Add(24 * time.Hour),
		MaxAge:   86400,
		HttpOnly: true,
		// Secure:   true,
		// SameSite: http.SameSiteNoneMode,
	})

}

func GoogleLoginHandler(w http.ResponseWriter, r *http.Request) {
	// Build the URL to redirect to Google's OAuth2 authorization endpoint
	authURL := fmt.Sprintf("https://accounts.google.com/o/oauth2/v2/auth?client_id=%s&redirect_uri=%s&response_type=code&scope=%s",
		url.QueryEscape(utils.GOOGLE_CLIENT_ID), url.QueryEscape(utils.REDIRECT_URI), url.QueryEscape(utils.Scopes))

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
		"client_id":     {utils.GOOGLE_CLIENT_ID},
		"client_secret": {utils.GOOGLE_CLIENT_SECRET},
		"redirect_uri":  {utils.REDIRECT_URI},
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
	userInfo, err := utils.GetUserInfo(accessToken)
	if err != nil {
		http.Error(w, "Failed to get user info: "+err.Error(), http.StatusInternalServerError)
		return
	}

	//fmt.Fprintf(w, "User Info: %+v", userInfo)
	//get user info
	email := userInfo["email"].(string)
	fname := userInfo["given_name"].(string)
	lname := userInfo["family_name"].(string)

	//check if user exists in db, if not create the user
	id, err := router.DB.EmailExistsQuery(email)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if id == 0 || id == -1 {
		// generate a hard,random password
		pswd := utils.GenerateCustomID()
		id, err = router.DB.SaveUserInfo(lname, fname, email, pswd, true, false)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	googleLoginIdentifier := utils.GenerateCustomID()

	func() {
		utils.GoogleIdentifierLock.Lock()
		utils.GoogleIdentifierMap[googleLoginIdentifier] = 1
		defer utils.GoogleIdentifierLock.Unlock()
	}()

	frontendURL := fmt.Sprintf("%s/login?id=%v&email=%s&session=%s", utils.SUCCESS_URL, id, email, googleLoginIdentifier)

	// Return HTML with script to replace the current window location
	html := fmt.Sprintf(`
		<html>
		<body>
			<script>
				window.location.replace("%s");
			</script>
		</body>
		</html>
	`, frontendURL)

	w.Header().Set("Content-Type", "text/html")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(html))

}

func RedirectHandler(w http.ResponseWriter, r *http.Request) {

	body := struct {
		Id        int64  `json:"id"`
		Email     string `json:"email"`
		SessionId string `json:"sessionId"`
	}{}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		fmt.Print(err)
		http.Error(w, "Decoding failed", http.StatusInternalServerError)
		return
	}
	defer r.Body.Close()

	fmt.Print(body)

	if utils.GoogleIdentifierMap[body.SessionId] == 0 {
		fmt.Print("Someone Applied Login hack!!")
		http.Error(w, "Oh boy, you messed up!!", http.StatusBadRequest)
		return
	}

	jwtToken, err := utils.CreateJWTToken(body.Id, body.Email)

	if err != nil {
		fmt.Println("Error creating JWT token:", err)
		http.Error(w, "Error creating JWT token", http.StatusInternalServerError)
		return
	}

	// Generate refresh token
	refreshToken, err := utils.CreateRefreshToken(body.Id, body.Email)

	if err != nil {
		fmt.Println("Error creating refresh token:", err)
		http.Error(w, "Error creating refresh token", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "access",
		Value:    jwtToken,
		Path:     "/",
		Expires:  time.Now().Add(15 * time.Minute),
		MaxAge:   900,
		HttpOnly: true,
		// Secure:   true,
		// SameSite: http.SameSiteNoneMode,
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh",
		Value:    refreshToken,
		Path:     "/",
		Expires:  time.Now().Add(24 * time.Hour),
		MaxAge:   86400,
		HttpOnly: true,
		// Secure:   true,
		// SameSite: http.SameSiteNoneMode,
	})

}

func LogOutHandler(w http.ResponseWriter, r *http.Request) {

	http.SetCookie(w, &http.Cookie{
		Name:     "access",
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0), // Set the cookie expiration to the past
		MaxAge:   -1,
		HttpOnly: true,
		// Secure:   true,
		// SameSite: http.SameSiteNoneMode,
	})

	// Clear the refresh token cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh",
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		HttpOnly: true,
		// Secure:   true,
		// SameSite: http.SameSiteNoneMode,
	})

	w.WriteHeader(http.StatusOK)
}
