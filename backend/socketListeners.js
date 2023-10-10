const { clientMap, paymentIdPendingMap, fundIdMap, pq } = require("./util");
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
//initialize socket.io and passing http server as argument to socketIO
//which gives io instant which can be used to listen for incoming socket connection and events
const ioserver = socketIO(server, {
  cors: {
    origin: "*",
  },
});

/*--------------------------------- SOCKET LISTENERS -----------------------------*/

// this starts when client is connected to server
ioserver.on("connection", (socket) => {
  console.log(
    "Client [",
    socket.request.connection.remoteAddress,
    "] is authenticated and connected."
  );

  socket.on("storeClientInfo", (customId) => {
    clientMap.set(socket.id, customId);

    const data = paymentIdPendingMap.get(customId + "");

    if (data) {
      socket.emit("paymentCompleted", data);
    }
  });

  // listens for any donations by clients and then stores them
  socket.on("donate", async (donationData) => {
    // After stripe confirms the amount execute this:

    console.log(
      "Client [",
      socket.request.connection.remoteAddress,
      "] donated $"
    );

    const index = fundIdMap.get(donationData.fundId);
    console.log(index);

    const fundUpdateQuery = {
      text: "UPDATE fundsdata SET donation_num = donation_num + 1, total_donation = total_donation + $1 WHERE id = $2",
      values: [donationData.amount, donationData.fundId],
    };

    const commentUpdateQuery = {
      text: "INSERT into comments (fund_id, donator, amount, comment) VALUES ($1, $2, $3, $4)",
      values: [
        donationData.fundId,
        donationData.donator,
        Number(donationData.amount),
        donationData.comment.comment,
      ],
    };

    const recentDonatorsUpdateQuery = {
      text: "INSERT INTO recentdonators (fund_id, donator, amount) VALUES ($1, $2, $3)",
      values: [
        donationData.fundId,
        donationData.donator,
        Number(donationData.amount),
      ],
    };

    const historyQuery = {
      text: "INSERT INTO history (user_id, amount, beneficiary, organizer, donated_at) VALUES ($1, $2, $3, $4, $5)",
      values: [
        donationData.user_id,
        Number(donationData.amount),
        donationData.beneficiary,
        donationData.organizer,
        "today",
      ],
    };

    await pool.query(historyQuery);
    await pool.query(fundUpdateQuery);
    await pool.query(recentDonatorsUpdateQuery);

    if (donationData.comment.comment) {
      fundsData[index].comments.unshift(donationData.comment);
      await pool.query(commentUpdateQuery);
    }

    //adding to total amount
    fundsData[index].total_donation += Number(donationData.amount);

    //adding to donations count
    fundsData[index].donation_num += 1;

    //pushing to recent donations
    fundsData[index].recentdonators.unshift({
      donator: donationData.donator,
      amount: Number(donationData.amount),
    });

    //pushing to leaderboard (using priority queue)
    fundsData[index].recentdonators.forEach((d) => pq.enqueue(d));
    const l = [];
    while (!pq.isEmpty()) {
      l.push(pq.dequeue());
    }
    fundsData[index].leaderboard = [...l];

    paymentIdPendingMap.delete(donationData.user_id);

    // broadcasts to every client

    const ID = clientMap.get(socket.id);

    ioserver.emit("donationByAnotherUser", {
      userId: ID,
      fundId: donationData.fundId,
      fundsData: fundsData,
    });
  });

  // client asks for this data before it loads the website
  socket.on("fundsData request", () => {
    console.log("Server: requested and sent");
    socket.emit("fundsData response", fundsData);
  });

  // client asks for this data before it loads the website
  socket.on("specific fund request", (fundId) => {
    const index = fundIdMap.get(fundId);
    socket.emit("specific fund response", fundsData[index]);
  });

  socket.on("history", async (user_id) => {
    let history = [];

    const userHistoryQuery = {
      text: "SELECT * FROM history WHERE user_id = $1",
      values: [user_id],
    };

    const res = await pool.query(userHistoryQuery);

    if (res.rows.length != 0) {
      history = [...res.rows];
    }

    socket.emit("historyClient", history);
  });

  socket.on("quit", () => {
    socket.disconnect();
  });

  // Server listens for the disconnect event
  // when disconnects it closes tcp connection
  socket.on("disconnect", () => {
    console.log(
      "Client [",
      socket.request.connection.remoteAddress,
      "] just disconnected."
    );

    clientMap.delete(socket.id);
  });
});

//  this listener will console log when socket connection to client fails
ioserver.on("connect_failed", () =>
  console.log("Not able to connect to the client")
);

module.exports = { app, server };
