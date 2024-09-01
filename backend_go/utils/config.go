package utils

import (
	"sync"
)

var (
	GOOGLE_CLIENT_ID     string
	GOOGLE_CLIENT_SECRET string
	REDIRECT_URI         string
	STRIPE_SECRET_KEY    string
	SUCCESS_URL          string
	ALLOWED_ORIGIN       string
	Scopes               = "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email"
	GoogleIdentifierMap  = make(map[string]int)
	GoogleIdentifierLock = sync.Mutex{}
	OtpMap               = make(map[string]struct{ Fname, Lname, Password, Email, Otp string })
	OtpLock              = sync.Mutex{}
)

type Response struct {
	Passed  bool   `json:"passed"`
	Message string `json:"message"`
}
