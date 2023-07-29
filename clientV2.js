const net = require("net");

const client = new net.Socket();

const PORT = 3000;
const SERVER_IP = ""; // Replace with the server's IP address

client.connect(PORT, SERVER_IP, () => {
  console.log("Connected to server!");
});

client.on("data", (data) => {
  console.log("Received data from server:", data.toString());
});

client.on("close", () => {
  console.log("Connection to server closed");
});
