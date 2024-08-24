package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// Bypass CORS for simplicity, do not use this in production
	CheckOrigin: func(r *http.Request) bool { return true },
}

func (router *Router) WsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Failed to upgrade to WebSocket:", err)
		return
	}
	defer conn.Close()

	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Read error:", err)
			break
		}
		fmt.Printf("Received: %s\n", message)

		fmt.Print(messageType)

		// if err := conn.WriteMessage(messageType, message); err != nil {
		// 	fmt.Println("Write error:", err)
		// 	break
		// }
	}
}
