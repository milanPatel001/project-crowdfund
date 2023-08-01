const socketIOClient = require("socket.io-client");
const { setTimeout } = require("timers/promises");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const SERVER_URL = "http://98.113.25.59:65535"; // Replace with the server's IP address and port
const SERVER_URL_LOCAL = "http://localhost:3000";

const socket = socketIOClient(SERVER_URL_LOCAL);

const funds = [
  "ABC Corp.",
  "Cancer fund",
  "Saving Environment Fund",
  "Scam Fund",
  "Education Fund",
];

// for async user input so that it doesn't block anything
function ask(question) {
  return new Promise((resolve, reject) => {
    rl.question(question, (input) => resolve(input));
  });
}

socket.on("connect", async () => {
  console.log("Connected to server!");

  await startInteractiveLoop();
});

//socket.emit("new message", { hello: "hello" });

socket.on("new message", (data) => {
  console.log("Received message from server:", data);
});

//listens for broadcasted amount info sent by server
socket.on("donation", async ({ socketId, amount, fundIndex }) => {
  console.log(
    "\nBroadcasted by Server: Client",
    socketId,
    "donated $",
    amount,
    "to",
    funds[fundIndex]
  );

  await setTimeout(1000); //for orderly outputs on console

  console.log("\nSelect an option");
  console.log(
    "1. Donate\n2. See the Donation amount\nq. Disconnect from the server."
  );

  console.log("Enter option: ");
});

socket.on("disconnect", () => {
  console.log("\nConnection to server closed");
});

//listens for amount info sent by server
socket.on("donation amount value", ({ value }) => {
  console.log("Current amount: $", value);
});

let option = "-";

async function startInteractiveLoop() {
  while (option !== "q") {
    await setTimeout(1000); //timeout for ordered display

    console.log("\nSelect an option");
    console.log(
      "1. Donate\n2. See the Donation amount\nq. Disconnect from the server."
    );

    option = await ask("\nEnter Option: ");
    if (option === "1") {
      await handleDonation();
    } else if (option === "2") {
      await getDonationAmount();
    } else if (option === "q") {
      socket.emit("quit");
      break;
    }
  }
}

async function handleDonation() {
  console.log("Choose a crowdfund to donate to:");
  console.log(
    "1. ABC Corp.\n2. Cancer fund\n3. Saving Environment Fund\n4. Scam Fund\n5. Education Fund"
  );

  let option = await ask("Enter the option here: ");

  if (Number(option) >= 1 && Number(option) <= 5) {
    let donation = await ask("Enter a donation amount: ");
    donation = Number(donation);

    console.log("\nDonated $", donation, "to", funds[option - 1], ".\n");

    socket.emit("donate", { amount: donation, index: Number(option) - 1 });
  }
}

async function getDonationAmount() {
  console.log("\nWhich crowdfund's amount do you want to see?");
  console.log(
    "1. ABC Corp.\n2. Cancer fund\n3. Saving Environment Fund\n4. Scam Fund\n5. Education Fund"
  );

  let option = await ask("Enter the option here: ");

  if (Number(option) >= 1 && Number(option) <= 5) {
    socket.emit("donation amount request", { index: Number(option) - 1 });
  }
}
