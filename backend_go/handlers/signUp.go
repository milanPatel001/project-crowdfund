package handlers

import (
	"backend/utils"
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/resend/resend-go/v2"
)

func (router *Router) OTPHandler(ctx context.Context) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		sign := struct {
			Fname    string `json:"fname"`
			Lname    string `json:"lname"`
			Email    string `json:"email"`
			Password string `json:"password"`
		}{}

		if err := json.NewDecoder(r.Body).Decode(&sign); err != nil {
			fmt.Print(err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer r.Body.Close()

		id, err := router.DB.EmailExistsQuery(ctx, sign.Email)

		if err != nil {
			fmt.Print(err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if id != 0 && id != -1 {
			fmt.Print("Email already exists!!")
			http.Error(w, "Email already exists!!", http.StatusBadRequest)
			return
		}

		otp := utils.GenerateOTP()
		fmt.Println("OTP: ", otp)

		params := &resend.SendEmailRequest{
			From:    "CrowdFundX <otp@5923999.xyz>",
			To:      []string{sign.Email},
			Html:    utils.OtpEmailHtmlTemplate(otp, sign.Fname),
			Subject: "Signup OTP",
			ReplyTo: "mp28238@example.com",
		}

		_, err = router.ResendClient.Emails.Send(params)
		if err != nil {
			fmt.Println(err.Error())
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		func() {
			utils.OtpLock.Lock()
			defer utils.OtpLock.Unlock()

			utils.OtpMap[sign.Email] = struct {
				Fname    string
				Lname    string
				Password string
				Email    string
				Otp      string
			}{sign.Fname, sign.Lname, sign.Password, sign.Email, otp}

		}()

		w.WriteHeader(http.StatusOK)

	}
}

func (router *Router) SignUpHandler(ctx context.Context) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		w.Header().Set("Content-Type", "application/json")

		body := struct {
			Email string `json:"email"`
			Otp   string `json:"otp"`
		}{}

		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			fmt.Print(err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		defer r.Body.Close()

		info, exists := utils.OtpMap[body.Email]

		if !exists {
			fmt.Print("Somehow you bypassed the otp flow. Halt!!!")
			http.Error(w, "Somehow you bypassed the otp flow. Halt!!!", http.StatusBadRequest)
			return
		}

		if body.Otp != info.Otp {
			fmt.Print("Otp doesnt match!!")
			http.Error(w, "Otp doesnt match!!", http.StatusBadRequest)
			return
		}

		_, err := router.DB.SaveUserInfo(ctx, info.Lname, info.Fname, info.Email, info.Password, false, true)

		if err != nil {
			fmt.Print(err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		func() {
			utils.OtpLock.Lock()
			delete(utils.OtpMap, body.Email)
			defer utils.OtpLock.Unlock()
		}()

		w.WriteHeader(http.StatusOK)
	}
}
