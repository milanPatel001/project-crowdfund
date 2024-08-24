package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

type Router struct {
	DB *Database
}

type Database struct {
	pool *pgxpool.Pool
}

func main() {
	godotenv.Load()

	port := os.Getenv("PORT")
	JWT_SECRET = []byte(os.Getenv("JWT_SECRET"))
	REFRESH_SECRET = []byte(os.Getenv("REFRESH_SECRET"))
	GOOGLE_CLIENT_ID = os.Getenv("GOOGLE_CLIENT_ID")
	GOOGLE_CLIENT_SECRET = os.Getenv("GOOGLE_CLIENT_SECRET")
	REDIRECT_URI = os.Getenv("REDIRECT_URI")

	if port == "" {
		port = ":8080"
	}

	pool, err := HandleDbConnection()

	if err != nil {
		fmt.Println("Error connecting to database:", err)
		return
	}

	DB := &Database{pool}
	router := &Router{DB}

	defer router.DB.pool.Close()

	r := chi.NewRouter()

	r.Post("/signup", router.SignUpHandler)
	r.Post("/login", router.LogInHandler)
	r.Post("/verifyToken", router.verifyToken)
	r.Get("/ws", router.WsHandler)

	r.HandleFunc("/auth/google", router.GoogleLoginHandler)
	r.Get("/auth/callback", router.GoogleCallbackHandler)

	fmt.Println("Server starting on port ", port)
	err = http.ListenAndServe(port, r)

	if err != nil && err != http.ErrServerClosed {
		fmt.Printf("ListenAndServe() error: %v", err)
	}

	fmt.Println("Server stopped")
}

/*

	Websockets
		- estabilish web socket connection with client after logging in


	Add event creation function
	Connect to S3

*/
