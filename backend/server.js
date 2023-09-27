//server
const http = require("http");
const socketIO = require("socket.io");
const { PriorityQueue } = require("@datastructures-js/priority-queue");
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Stripe = require("stripe");

require("dotenv").config();

const app = express();
app.use(cors());

const stripe = Stripe(`${process.env.STRIPE_SECRET_KEY}`);

const server = http.createServer(app);

const port = process.env.PORT || 3000; // Port number that server listens for incoming connection

//initialize socket.io and passing http server as argument to socketIO
//which gives io instant which can be used to listen for incoming socket connection and events
const ioserver = socketIO(server, {
  cors: {
    origin: "*",
  },
});

const pq = new PriorityQueue((a, b) => {
  if (a.amount > b.amount) {
    return -1;
  }
  if (a.amount < b.amount) {
    return 1;
  }
});

app.use(cors());
app.use(express.json());

let fundsData = [];

/* -------------------------------EXPRESS ENDPOINTS ----------------------------*/

app.post("/signup", async (req, res) => {
  try {
    const { lname, fname, email, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userSignUpQuery = {
      text: "INSERT INTO users(fname, lname, email, hashed_password) VALUES ($1, $2, $3, $4) RETURNING id",
      values: [fname, lname, email, hashedPassword],
    };

    const resl = await pool.query(userSignUpQuery);
    if (resl.rows.length != 0) {
      return res.status(200).send({ passed: true });
    }
  } catch (ex) {
    res.status(401).send({ passed: false });
  }
});

//handles login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userQuery = {
      text: "SELECT * FROM users WHERE email = $1",
      values: [email],
    };

    let user = "";

    const resl = await pool.query(userQuery);

    if (resl.rows.length != 0) {
      user = await bcrypt.compare(password, resl.rows[0].hashed_password);
    } else return res.status(401).send({ passed: false });

    if (user) {
      //creates jwt
      const token = jwt.sign(
        { email: req.body.email, id: resl.rows[0].id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "2h",
        }
      );

      return res.status(200).json({ passed: true, token });
    } else {
      return res.status(401).json({ passed: false });
    }
  } catch (ex) {
    console.warn(ex);
  }
});

app.post("/verifyToken", async (req, res) => {
  const token = req.body.token;

  // console.log("AUTH::" + req.body.token);

  if (!token) return res.status(401).send({ passed: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (decoded) {
      const fundsQuery = {
        text: "SELECT fd.*, coalesce(c_agg.comments_agg, '[]'::json) AS comments, coalesce(rd_agg.recent_donators_agg, '[]'::json) AS recentDonators FROM fundsData AS fd LEFT JOIN (SELECT fund_id, json_agg(json_build_object('id', id, 'donator', donator, 'amount', amount, 'comment', comment)) AS comments_agg FROM comments GROUP BY fund_id) AS c_agg ON fd.id = c_agg.fund_id LEFT JOIN (SELECT fund_id, json_agg(json_build_object('donator', donator, 'amount', amount)) AS recent_donators_agg FROM recentDonators GROUP BY fund_id) AS rd_agg ON fd.id = rd_agg.fund_id",
        values: [],
      };

      const result = await pool.query(fundsQuery);

      if (result.rows.length != 0) {
        fundsData = [...result.rows];

        //add leaderboard key
        fundsData.forEach((f) => (f["leaderboard"] = [...f.recentdonators]));

        // console.log(fundsData);
      }
    }

    return res.status(200).send({ passed: true, decoded });
  } catch (ex) {
    res.status(400).send({ passed: false });
  }
});

app.post("/createCheckoutSession", async (req, res) => {
  //console.log(req.body);

  let session;

  try {
    session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: req.body.amount * 100,
            product_data: {
              name: req.body.beneficiary,
              description: "Donating to " + req.body.beneficiary,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://project-crowdfund.vercel.app",
      payment_method_types: ["card", "cashapp", "paypal"],
      metadata: {
        data: req.body,
      },
    });
  } catch (ex) {
    console.log(ex);
    return res.status(500).send({ passed: false });
  }

  return res.status(200).send({ id: session.id });
});

app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event = req.body;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_SIGNING_SECRET
    );
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    ioserver.emit("paymentCompleted", data);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send({ passed: true });
});

/*--------------------------------- SOCKET LISTENERS -----------------------------*/

// this starts when client is connected to server
ioserver.on("connection", (socket) => {
  console.log(
    "Client [",
    socket.request.connection.remoteAddress,
    "] is authenticated and connected."
  );

  // listens for any donations by clients and then stores them
  socket.on("donate", async (donationData) => {
    // After stripe confirms the amount execute this:

    console.log(
      "Client [",
      socket.request.connection.remoteAddress,
      "] donated $",
      donationData.amount,
      "to",
      fundsData[donationData.index].name
    );

    const fundUpdateQuery = {
      text: "UPDATE fundsdata SET donation_num = donation_num + 1, total_donation = total_donation + $1 WHERE id = $2",
      values: [donationData.amount, donationData.index + 1],
    };

    const commentUpdateQuery = {
      text: "INSERT into comments (fund_id, donator, amount, comment) VALUES ($1, $2, $3, $4)",
      values: [
        donationData.index + 1,
        donationData.donator,
        Number(donationData.amount),
        donationData.comment.comment,
      ],
    };

    const recentDonatorsUpdateQuery = {
      text: "INSERT INTO recentdonators (fund_id, donator, amount) VALUES ($1, $2, $3)",
      values: [
        donationData.index + 1,
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

    //adding to total amount
    fundsData[donationData.index].total_donation += donationData.amount;

    //adding to donations count
    fundsData[donationData.index].donation_num += 1;

    //pushing to recent donations
    fundsData[donationData.index].recentdonators.unshift({
      donator: donationData.donator,
      amount: donationData.amount,
    });

    //pushing to leaderboard (using priority queue)
    fundsData[donationData.index].recentdonators.forEach((d) => pq.enqueue(d));
    const l = [];
    while (!pq.isEmpty()) {
      l.push(pq.dequeue());
    }
    fundsData[donationData.index].leaderboard = [...l];

    if (donationData.comment.comment) {
      fundsData[donationData.index].comments.unshift(donationData.comment);
      await pool.query(commentUpdateQuery);
    }

    //broadcasts to every client
    ioserver.emit("donation", {
      socketId: socket.id,
      amount: donationData.amount,
      fundOrganizer: fundsData[donationData.index].name,
      donator: donationData.donator,
      index: donationData.index,
      fundsData: fundsData,
    });
  });

  // client asks for this data before it loads the website
  socket.on("fundsData request", () => {
    console.log("Server: requested and sent");
    //console.log(fundsData);
    socket.emit("fundsData response", fundsData);
  });

  // client asks for this data before it loads the website
  socket.on("specific fund request", (index) => {
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
  });
});

//  this listener will console log when socket connection to client fails
ioserver.on("connect_failed", () =>
  console.log("Not able to connect to the client")
);

// starts the server that listen to a specified port
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
