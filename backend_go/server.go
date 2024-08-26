package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
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
	} else {
		port = ":" + port
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

	r.Use(cors.Handler(cors.Options{
		// AllowedOrigins:   []string{"https://foo.com"}, // Use this to allow specific origin hosts
		AllowedOrigins: []string{"https://*", "http://*"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           86400, // Maximum value not ignored by any of major browsers
	}))

	r.Post("/signup", router.SignUpHandler)
	r.Post("/login", router.LogInHandler)
	r.Post("/verifyToken", router.verifyToken)

	r.HandleFunc("/auth/google", router.GoogleLoginHandler)
	r.Get("/auth/callback", router.GoogleCallbackHandler)

	r.Get("/ws", router.WsHandler)

	r.Get("/fundsData", router.FundsDataHandler)

	fmt.Println("Server starting on port ", port)
	err = http.ListenAndServe(port, r)

	if err != nil && err != http.ErrServerClosed {
		fmt.Printf("ListenAndServe() error: %v", err)
	}

	fmt.Println("Server stopped")
}
