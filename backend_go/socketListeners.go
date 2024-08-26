package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Message struct {
	Event   string `json:"event"`
	Content string `json:"content"`
	Message string `json:"message"`
}

var (
	clients = make(map[string]*websocket.Conn)
	lock    = sync.Mutex{}

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

	clientID := GenerateCustomID()

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
		fmt.Printf("Received msg from: %s\n", clientID)

		fmt.Printf("%s", message)

		jsonMsg, _ := json.Marshal(Message{"ss", "dd", "ff"})

		sendMessageToClient(clientID, []byte(jsonMsg))

	}
}

func sendMessageToClient(clientID string, message []byte) {
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

func broadcastMessage(message []byte) {
	lock.Lock()
	defer lock.Unlock()

	for id, conn := range clients {
		err := conn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			fmt.Println("Error broadcasting message to client", id, ":", err)
		}
	}
}
