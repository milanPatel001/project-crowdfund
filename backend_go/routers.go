package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"sync"
	"time"

	"github.com/stripe/stripe-go/v79"
	"github.com/stripe/stripe-go/v79/checkout/session"
)

var (
	GOOGLE_CLIENT_ID     string
	GOOGLE_CLIENT_SECRET string
	REDIRECT_URI         string
	STRIPE_SECRET_KEY    string
	scopes               = "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email"
	googleIdentifierMap  = make(map[string]int)
	googleIdentifierLock = sync.Mutex{}
)

type Response struct {
	Passed  bool   `json:"passed"`
	Message string `json:"message"`
}

func (router *Router) VerifyToken(w http.ResponseWriter, r *http.Request) {

	fmt.Println("\nInside Verify TOken\n")

	// get both access and refresh token
	accessTokenCookie, err := r.Cookie("access")
	refreshTokenCookie, err := r.Cookie("refresh")

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

	accessToken := accessTokenCookie.Value
	refreshToken := refreshTokenCookie.Value

	if (accessToken == "") && (refreshToken == "") {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Access and refresh tokens are missing"))
		return
	}

	err = ValidateToken(accessToken, "access")

	// access token expired
	if err != nil {
		fmt.Println(err)
		err = ValidateToken(refreshToken, "refresh")

		// refresh token expired
		if err != nil {
			fmt.Println(err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		//generate new access token and then send it
		token, err := GetToken(refreshToken, REFRESH_SECRET)

		if err != nil {
			fmt.Println(err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		userId, email := GetClaims(token)
		newJwtToken, err := CreateJWTToken(userId, email)

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
			MaxAge:   86400,
			HttpOnly: true,
			//Secure:   true,
		})
		w.Write([]byte(strconv.Itoa(int(userId))))

		return

	}

	token, err := GetToken(accessToken, JWT_SECRET)

	if err != nil {
		fmt.Println("Error getting token from access token:", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	id, _ := GetClaims(token)
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

	jwtToken, err := CreateJWTToken(id, sign.Email)

	if err != nil {
		fmt.Println("Error creating JWT token:", err)
		http.Error(w, "Error creating JWT token", http.StatusInternalServerError)
		return
	}

	// Generate refresh token
	refreshToken, err := CreateRefreshToken(id, sign.Email)

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
		MaxAge:   86400,
		HttpOnly: true,
		//Secure:   true,
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh",
		Value:    refreshToken,
		Path:     "/",
		Expires:  time.Now().Add(24 * 7 * time.Hour),
		MaxAge:   86400,
		HttpOnly: true,
		//Secure:   true,
	})

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

	id, err := router.DB.EmailExistsQuery(sign.Email)

	if err != nil {
		fmt.Print(err)
		json.NewEncoder(w).Encode(Response{false, err.Error()})
		return
	}

	if id != 0 {
		fmt.Print("Email already exists!!")
		// If email exists and its a google login, Update the user with new password and remove the false error
		json.NewEncoder(w).Encode(Response{false, "Email already exists"})
		return
	}

	_, err = router.DB.SaveUserInfo(sign.Lname, sign.Fname, sign.Email, sign.Password, false)

	if err != nil {
		fmt.Print(err)
		json.NewEncoder(w).Encode(Response{false, "Not able to save in Database right now!!"})
		return
	}

	json.NewEncoder(w).Encode(Response{true, ""})
}

func (router *Router) FundsDataHandler(w http.ResponseWriter, r *http.Request) {
	fundsData, err := router.DB.GetFundsData()

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(fundsData)

}

func (router *Router) CreateCheckoutSession(w http.ResponseWriter, r *http.Request) {

	fmt.Println("Inside Create Checkout Session")

	body := struct {
		FundId      string `json:"fundId"`
		Amount      int    `json:"amount"`
		Donator     string `json:"donator"`
		UserId      string `json:"userId"`
		Organizer   string `json:"organizer"`
		Beneficiary string `json:"beneficiary"`
		Comment     string `json:"comment"`
	}{}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		fmt.Print(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer r.Body.Close()

	metaDataMap := make(map[string]string)

	metaDataMap["customId"] = body.UserId
	metaDataMap["fundId"] = body.FundId
	metaDataMap["amount"] = strconv.Itoa(body.Amount)
	metaDataMap["donator"] = body.Donator
	metaDataMap["userId"] = body.UserId
	metaDataMap["organizer"] = body.Organizer
	metaDataMap["beneficiary"] = body.Beneficiary
	metaDataMap["comment"] = body.Comment

	params := &stripe.CheckoutSessionParams{
		SuccessURL:         stripe.String("http://localhost:3000"),
		PaymentMethodTypes: stripe.StringSlice([]string{"card"}),

		LineItems: []*stripe.CheckoutSessionLineItemParams{
			&stripe.CheckoutSessionLineItemParams{
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency:   stripe.String("usd"),
					UnitAmount: stripe.Int64(int64(body.Amount) * 100),
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name:        stripe.String(body.Beneficiary),
						Description: stripe.String("Donating to: " + body.Beneficiary),
					},
				},
				//Price:    stripe.String("price_1MotwRLkdIwHu7ixYcPLm5uZ"),
				Quantity: stripe.Int64(1),
			},
		},
		Mode:     stripe.String(string(stripe.CheckoutSessionModePayment)),
		Metadata: metaDataMap,
	}

	result, _ := session.New(params)

	//fmt.Print(result.URL)

	w.Write([]byte(result.URL))

}

func (router *Router) StripeWebhookHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Inside Webhook")

	const MaxBodyBytes = int64(65536)
	r.Body = http.MaxBytesReader(w, r.Body, MaxBodyBytes)
	payload, err := io.ReadAll(r.Body)

	if err != nil {
		fmt.Printf("Error reading request body: %v\n", err)
		w.WriteHeader(http.StatusServiceUnavailable)
		return
	}

	event := stripe.Event{}

	if err := json.Unmarshal(payload, &event); err != nil {
		fmt.Printf("Failed to parse webhook body json: %v\n", err.Error())
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	eventType := event.Type

	if eventType == "checkout.session.completed" {
		var session stripe.CheckoutSession
		err := json.Unmarshal(event.Data.Raw, &session)
		if err != nil {
			fmt.Printf("Error parsing webhook JSON: %v\n", err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		fmt.Println(session.Metadata)

		// **** Save info in DB using transaction
		err = router.DB.SaveDonation(session.Metadata)

		if err != nil {
			fmt.Println("Could not save donation data in DB")
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		amount, _ := strconv.Atoi(session.Metadata["amount"])
		paymentCompletedMap[session.Metadata["userId"]] = Donator{
			session.Metadata["fundId"],
			amount,
			session.Metadata["beneficiary"],
			session.Metadata["donator"],
			session.Metadata["comment"],
		}

		// broadcast fundId, userId, amount, donator, comment
		m := Message[Donator]{
			"donationBroadcast",
			paymentCompletedMap[session.Metadata["userId"]],
			"donation broadcast",
		}

		msg, _ := json.Marshal(m)

		err = BroadcastMessage(msg)
		if err != nil {
			fmt.Println("Error broadcasting the donation data!!!")
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}

	}

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

	if id == 0 {
		// generate a hard,random password
		id, err = router.DB.SaveUserInfo(lname, fname, email, "pop", true)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	googleLoginIdentifier := GenerateCustomID()

	func() {
		googleIdentifierLock.Lock()
		googleIdentifierMap[googleLoginIdentifier] = 1
		defer googleIdentifierLock.Unlock()
	}()

	//frontendURL := fmt.Sprintf("http://localhost:3000/login")
	frontendURL := fmt.Sprintf("http://localhost:3000/login?id=%v&email=%s&session=%s", id, email, googleLoginIdentifier)

	//add google login identifier to frontendURl to prevent login hacks

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

func (router *Router) RedirectHandler(w http.ResponseWriter, r *http.Request) {

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

	if googleIdentifierMap[body.SessionId] == 0 {
		fmt.Print("Someone Applied Login hack!!")
		http.Error(w, "Oh boy, you messed up!!", http.StatusBadRequest)
		return
	}

	jwtToken, err := CreateJWTToken(body.Id, body.Email)

	if err != nil {
		fmt.Println("Error creating JWT token:", err)
		http.Error(w, "Error creating JWT token", http.StatusInternalServerError)
		return
	}

	// Generate refresh token
	refreshToken, err := CreateRefreshToken(body.Id, body.Email)

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
		MaxAge:   86400,
		HttpOnly: true,
		//Secure:   true,
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh",
		Value:    refreshToken,
		Path:     "/",
		Expires:  time.Now().Add(24 * 7 * time.Hour),
		MaxAge:   86400,
		HttpOnly: true,
		//Secure:   true,
	})

}
