package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

func (router *Router) FundsDataHandler(w http.ResponseWriter, r *http.Request) {
	fundsData, err := router.DB.GetFundsData()

	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(fundsData)

}

func (router *Router) HistoryHandler(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	id, _ := strconv.Atoi(q.Get("id"))
	data, err := router.DB.GetUserHistory(id)

	if err != nil {
		fmt.Println("Can't fetch history")
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
