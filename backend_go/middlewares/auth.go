package middlewares

import (
	"backend/utils"
	"errors"
	"fmt"
	"net/http"
)

func VerifyAccessToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		accessTokenCookie, err := r.Cookie("access")

		if err != nil {
			if errors.Is(err, http.ErrNoCookie) {
				fmt.Println("Access token cookie not found:")
				http.Error(w, "Access token cookie not found", http.StatusForbidden)
			} else {
				fmt.Println("Error retrieving access token cookie:", err)
				http.Error(w, "Server error", http.StatusInternalServerError)
			}
			return
		}

		accessToken := accessTokenCookie.Value

		if accessToken == "" {
			w.WriteHeader(http.StatusForbidden)
			w.Write([]byte("Access token is missing"))
			return
		}

		err = utils.ValidateToken(accessToken, "access")

		// access token expired
		if err != nil {
			fmt.Println("Access token not valid !!!")
			http.Error(w, "Access token not valid", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}
