//server
const http = require("http");
const socketIO = require("socket.io");
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Stripe = require("stripe");
const { pq, fundIdMap, paymentIdPendingMap, clientMap } = require("./util");
const socketFunction = require("./socketListeners");

require("dotenv").config();

const app = express();
app.use(cors());

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const server = http.createServer(app);

const port = process.env.PORT || 3000; // Port number that server listens for incoming connection

//initialize socket.io and passing http server as argument to socketIO
//which gives io instant which can be used to listen for incoming socket connection and events
const ioserver = socketIO(server, {
  cors: {
    origin: "*",
  },
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

        //add leaderboard key and mapping fundId to index

        for (let i = 0; i < fundsData.length; i++) {
          fundsData[i].recentdonators.forEach((d) => pq.enqueue(d));
          const l = [];
          while (!pq.isEmpty()) {
            l.push(pq.dequeue());
          }

          fundsData[i]["leaderboard"] = [...l];
          fundIdMap.set(Number(fundsData[i].id), i);
        }

        // console.log(fundsData);
      }
    }

    return res.status(200).send({ passed: true, decoded });
  } catch (ex) {
    res.status(400).send({ passed: false });
  }
});

app.post("/createCheckoutSession", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
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
      payment_method_types: ["card"],
      metadata: {
        customId: req.body.user_id,
        fundId: req.body.fundId,
        amount: req.body.amount,
        donator: req.body.donator,
        user_id: req.body.user_id,
        organizer: req.body.organizer,
        beneficiary: req.body.beneficiary,
        socketId: req.body.socketId,
        commentDonator: req.body.comment.donator,
        commentAmount: req.body.comment.amount,
        comment: req.body.comment.comment,
      },
    });

    return res.status(200).send({ url: session.url });
  } catch (ex) {
    console.log(ex);
    return res.status(500).send({ passed: false });
  }
});

app.post("/webhook", (req, res) => {
  console.log("INside webhook");

  // const sig = req.headers["stripe-signature"];

  let event = req.body;

  // try {
  //   event = stripe.webhooks.constructEvent(
  //     payload,
  //     sig,
  //     process.env.STRIPE_SIGNING_SECRET
  //   );
  // } catch (err) {
  //   console.log(err);
  //   return res.sendStatus(400);
  // }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const commentObj = {
      donator: session.metadata.commentDonator,
      amount: session.metadata.commentAmount,
      comment: session.metadata.comment,
    };

    const data = {
      customId: session.metadata.user_id,
      fundId: Number(session.metadata.fundId),
      amount: session.metadata.amount,
      donator: session.metadata.donator,
      user_id: session.metadata.user_id,
      organizer: session.metadata.organizer,
      beneficiary: session.metadata.beneficiary,
      socketId: session.metadata.socketId,
      comment: commentObj,
    };

    paymentIdPendingMap.set(session.metadata.customId, data);
  }

  // Return a 200 response to acknowledge receipt of the event
  return res.json({ received: true });
});

/*--------------------------------- SOCKET LISTENERS -----------------------------*/

// this starts when client is connected to server
ioserver.on("connection", (socket) => {
  socketFunction(socket, fundsData, ioserver);
});

//  this listener will console log when socket connection to client fails
ioserver.on("connect_failed", () =>
  console.log("Not able to connect to the client")
);

// starts the server that listen to a specified port
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
