package handlers

import (
	"backend/utils"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Content struct {
	UserId string `json:"userId"`
}

type Donator struct {
	FundId      string `json:"fundId"`
	Amount      int    `json:"amount"`
	Beneficiary string `json:"beneficiary"`
	Name        string `json:"donator"`
	Comment     string `json:"comment"`
}

type Message[T []byte | Donator | Content] struct {
	Event   string `json:"event"`
	Content T      `json:"content"`
	Message string `json:"message"`
}

var (
	// map of userIds who donated (on joining, client can send a ws event to check if userId exist in this map, if there, then it can show toast)
	paymentCompletedMap = make(map[string]Donator)
	clients             = make(map[string]*websocket.Conn)
	lock                = sync.Mutex{}
	mapLock             = sync.Mutex{}

	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		// Bypass CORS for simplicity, do not use this in production
		CheckOrigin: func(r *http.Request) bool { return true },
	}
)

func (router *Router) WsHandler(w http.ResponseWriter, r *http.Request) {

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Failed to upgrade to WebSocket:", err)
		return
	}

	clientID := utils.GenerateCustomID()

	lock.Lock()
	clients[clientID] = conn
	lock.Unlock()

	fmt.Println("Client connected:", clientID)

	defer func() {
		lock.Lock()
		delete(clients, clientID)
		lock.Unlock()
		conn.Close()
	}()

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Read error:", err)
			break
		}

		msg := Message[Content]{}

		_ = json.Unmarshal(message, &msg)

		fmt.Printf("Received msg from: %s\n", clientID)
		fmt.Println(msg)

		//one event for checking ids in donated map on startup
		switch msg.Event {
		case "paymentCompletedCheck":

			value, exists := paymentCompletedMap[msg.Content.UserId]

			var m Message[Donator]

			if exists {
				m = Message[Donator]{"paymentCompletedCheck", value, "This user donated!!"}
			} else {
				m = Message[Donator]{"paymentCompletedCheck", Donator{}, "This user didn't contribute to anything!!"}
			}

			res, _ := json.Marshal(m)

			SendMessageToClient(clientID, res)
		case "removePaymentCheck":
			mapLock.Lock()
			delete(paymentCompletedMap, msg.Content.UserId)
			mapLock.Unlock()
		case "removeIdentifier":
			mapLock.Lock()
			// here, userId is sessionId
			delete(utils.GoogleIdentifierMap, msg.Content.UserId)
			mapLock.Unlock()
		default:
			res, _ := json.Marshal(Message[[]byte]{"def", []byte("Freee!!!"), "Ting!!"})
			SendMessageToClient(clientID, res)

		}

	}
}

func SendMessageToClient(clientID string, message []byte) {
	lock.Lock()
	defer lock.Unlock()

	conn, exists := clients[clientID]
	if !exists {
		fmt.Println("Client not found:", clientID)
		return
	}

	err := conn.WriteMessage(websocket.TextMessage, message)
	if err != nil {
		fmt.Println("Error sending message to client:", err)
	}
}

func BroadcastMessage(message []byte) error {
	lock.Lock()
	defer lock.Unlock()

	for id, conn := range clients {
		err := conn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			fmt.Println("Error broadcasting message to client", id, ":", err)
			return err
		}
	}
	return nil
}
