const socketIOClient = require("socket.io-client");

const SERVER_URL = "http://192.168.1.100:3000"; // Replace with the server's IP address and port

const socket = socketIOClient(SERVER_URL);

socket.on("connect", () => {
  console.log("Connected to server!");
});

socket.on("new message", (data) => {
  console.log("Received message from server:", data);
});

socket.on("disconnect", () => {
  console.log("Connection to server closed");
});
