package handlers

import (
	"backend/utils"
	"encoding/json"
	"fmt"
	"net/http"
)

func (router *Router) OTPHandler(w http.ResponseWriter, r *http.Request) {

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

	id, err := router.DB.EmailExistsQuery(sign.Email)

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

	func() {
		utils.OtpLock.Lock()

		utils.OtpMap[sign.Email] = struct {
			Fname    string
			Lname    string
			Password string
			Email    string
			Otp      string
		}{sign.Fname, sign.Lname, sign.Password, sign.Email, otp}

		defer utils.OtpLock.Unlock()
	}()

	w.WriteHeader(http.StatusOK)

}

func (router *Router) SignUpHandler(w http.ResponseWriter, r *http.Request) {

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

	_, err := router.DB.SaveUserInfo(info.Lname, info.Fname, info.Email, info.Password, false, true)

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
