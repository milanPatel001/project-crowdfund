package handlers

import (
	"backend/utils"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"

	"github.com/stripe/stripe-go/v79"
	"github.com/stripe/stripe-go/v79/checkout/session"
)

func (router *Router) StripeWebhookHandler(ctx context.Context) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
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
			err = router.DB.SaveDonation(ctx, session.Metadata)

			if err != nil {
				fmt.Println("Could not save donation data in DB")
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			amount, _ := strconv.Atoi(session.Metadata["amount"])

			func() {
				lock.Lock()
				paymentCompletedMap[session.Metadata["userId"]] = Donator{
					session.Metadata["fundId"],
					amount,
					session.Metadata["beneficiary"],
					session.Metadata["donator"],
					session.Metadata["comment"],
				}
				defer lock.Unlock()
			}()

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
}

func CreateCheckoutSession(w http.ResponseWriter, r *http.Request) {

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
		SuccessURL:         stripe.String(utils.SUCCESS_URL),
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
