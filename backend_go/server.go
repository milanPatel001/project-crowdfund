package main

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"backend/handlers"
	"backend/utils"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
	"github.com/resend/resend-go/v2"
	"github.com/stripe/stripe-go/v79"
)

func main() {
	godotenv.Load()

	port := os.Getenv("PORT")
	utils.JWT_SECRET = []byte(os.Getenv("JWT_SECRET"))
	utils.REFRESH_SECRET = []byte(os.Getenv("REFRESH_SECRET"))
	utils.GOOGLE_CLIENT_ID = os.Getenv("GOOGLE_CLIENT_ID")
	utils.GOOGLE_CLIENT_SECRET = os.Getenv("GOOGLE_CLIENT_SECRET")
	utils.REDIRECT_URI = os.Getenv("REDIRECT_URI")
	utils.STRIPE_SECRET_KEY = os.Getenv("STRIPE_SECRET_KEY")
	utils.SUCCESS_URL = os.Getenv("SUCCESS_URL")
	utils.ALLOWED_ORIGIN = os.Getenv("ALLOW")
	utils.AWS_ACCESS_KEY_ID = os.Getenv("AWS_ACCESS_KEY_ID")
	utils.AWS_SECRET_ACCESS_KEY = os.Getenv("AWS_SECRET_ACCESS_KEY")
	utils.AWS_REGION = os.Getenv("AWS_REGION")
	utils.AWS_BUCKET = os.Getenv("AWS_BUCKET")
	utils.RESEND_API_KEY = os.Getenv("RESEND_API_KEY")

	if utils.ALLOWED_ORIGIN == "" {
		utils.ALLOWED_ORIGIN = "https://*"
	}

	stripe.Key = utils.STRIPE_SECRET_KEY

	if port == "" {
		port = ":8080"
	} else {
		port = ":" + port
	}

	ctx := context.Background()
	awsCtx := context.TODO()

	pool, err := handlers.HandleDbConnection(ctx)

	if err != nil {
		fmt.Println("Error connecting to database:", err)
		return
	}

	cfg, err := config.LoadDefaultConfig(awsCtx)
	if err != nil {
		fmt.Println(err)
		return
	}

	// Create an Amazon S3 service client
	client := s3.NewFromConfig(cfg)

	//Resend Client
	resendClient := resend.NewClient(utils.RESEND_API_KEY)

	DB := &handlers.Database{Pool: pool}
	router := &handlers.Router{DB: DB, ResendClient: resendClient}
	awsRouter := &handlers.AWSRouter{DB: DB, Client: client}

	defer router.DB.Pool.Close()

	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		// AllowedOrigins:   []string{"https://foo.com"}, // Use this to allow specific origin hosts
		AllowedOrigins: []string{utils.ALLOWED_ORIGIN, "http://localhost:3000"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           86400, // Maximum value not ignored by any of major browsers
	}))

	r.Post("/generateOtp", router.OTPHandler(ctx))
	r.Post("/verifyOtp", router.SignUpHandler(ctx))

	r.Post("/login", router.LogInHandler(ctx))
	r.Post("/verifyToken", handlers.VerifyToken)
	r.HandleFunc("/auth/google", handlers.GoogleLoginHandler)
	r.HandleFunc("/auth/callback", router.GoogleCallbackHandler(ctx))
	r.Post("/auth/redirect", handlers.RedirectHandler)
	r.Get("/logout", handlers.LogOutHandler)

	r.Get("/ws", router.WsHandler)

	r.Get("/fundsData", router.FundsDataHandler(ctx))
	r.Get("/history", router.HistoryHandler(ctx))
	r.Post("/createCrowdFund", awsRouter.FundCreationHandler(awsCtx))

	r.Post("/createCheckoutSession", handlers.CreateCheckoutSession)
	r.HandleFunc("/webhook", router.StripeWebhookHandler(ctx))

	fmt.Println("Server starting on port ", port)
	err = http.ListenAndServe(port, r)

	if err != nil && err != http.ErrServerClosed {
		fmt.Printf("ListenAndServe() error: %v", err)
	}

	fmt.Println("Server stopped")
}
