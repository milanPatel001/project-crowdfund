const socketIOClient = require("socket.io-client");
const { setTimeout } = require("timers/promises");
const readline = require("readline");

const readlineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(questionText) {
  return new Promise((resolve, reject) => {
    readlineInterface.question(questionText, (input) => resolve(input));
  });
}

const SERVER_URL = "http://98.113.25.59:65535"; // Replace with the server's IP address and port
const SERVER_URL_LOCAL = "http://localhost:3000";

const socket = socketIOClient(SERVER_URL_LOCAL);

socket.on("connect", async () => {
  console.log("Connected to server!");

  await startInteractiveLoop();
});

//socket.emit("new message", { hello: "hello" });

socket.on("new message", (data) => {
  console.log("Received message from server:", data);
});

socket.on("donation", (value) => {
  console.log("Current total value", value);
});

socket.on("disconnect", () => {
  console.log("Connection to server closed");
});

let option = "";

async function startInteractiveLoop() {
  while (option !== "q") {
    await setTimeout(1000);
    option = await ask("Option: ");
    if (option === "1") {
      let donation = await ask("Donation: ");
      donation = Number(donation);

      socket.emit("donate", donation);
    } else if (option === "q") {
      socket.emit("quit");
      break;
    }
  }
}
