package utils

import (
	"sync"
)

var (
	GOOGLE_CLIENT_ID      string
	GOOGLE_CLIENT_SECRET  string
	REDIRECT_URI          string
	STRIPE_SECRET_KEY     string
	SUCCESS_URL           string
	ALLOWED_ORIGIN        string
	AWS_ACCESS_KEY_ID     string
	AWS_SECRET_ACCESS_KEY string
	AWS_REGION            string
	AWS_BUCKET            string
	RESEND_API_KEY        string
	GoogleIdentifierMap   = make(map[string]int)
	GoogleIdentifierLock  = sync.Mutex{}
	OtpMap                = make(map[string]struct{ Fname, Lname, Password, Email, Otp string })
	OtpLock               = sync.Mutex{}
)

const Scopes = "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email"

type Response struct {
	Passed  bool   `json:"passed"`
	Message string `json:"message"`
}
