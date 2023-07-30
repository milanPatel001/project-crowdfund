const socketIOClient = require("socket.io-client");
const prompt = require("prompt-async");

const SERVER_URL = "http://98.113.25.59:65535"; // Replace with the server's IP address and port

const socket = socketIOClient(SERVER_URL);

socket.on("connect", async () => {
  console.log("Connected to server!");

  //await startInteractiveLoop();
});

socket.emit("new message", { hello: "hello" });

socket.on("new message", (data) => {
  console.log("Received message from server:", data);
});

socket.on("curr value", (value) => {
  console.log("Current total value", value);
});

socket.on("disconnect", () => {
  console.log("Connection to server closed");
});

let opt = "";

/*
async function startInteractiveLoop() {
  while (opt !== "q") {
    prompt.start();
    const { v } = await prompt.get(["v"]);
    opt = v;
    console.log(v);

    if (opt === "1") {
      prompt.start();
      const { bid } = await prompt.get(["bid"]);
      Number(bid);

      socket.emit("bid", bid);
    } else if (opt === "q") {
      socket.emit("quit");
    }
  }
}
*/
