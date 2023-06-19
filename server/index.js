const express = require("express");
const { connection } = require("./config/db");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const passport = require("passport");
// Import configuration file from google.js
const googleConfig = require("./oauth/google.js");
const jwt = require("jsonwebtoken");
const { User } = require("./models/user.model");
// uuid
const { v4: uuidv4 } = require("uuid");
const { authenticate } = require("./middlewares/auth");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const axios = require("axios");
const cors = require("cors");
const { rbac } = require("./middlewares/rbac");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("PSC home route.");
});
app.get("/loggedIn", (req, res) => {
  res.send("Logged in");
});
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  async function (req, res) {
    try {
      // Successful authentication, redirect home.
      const { accessToken, name, email } = req.user;
      const isUserPresent = await User.findOne({ email });
      if (!isUserPresent) {
        // token, user_email, name, profile =>
        // create a new user
        const newUser = new User({ name, email, password: uuidv4() });
        // store this to mongodb database; 2 months a person again to access
        await newUser.save();

        // generate a new access token
        // const accessToken = jwt.sign(
        //   { email, userId: newUser._id },
        //   process.env.JWT_ACCESS_KEY,
        //   {
        //     expiresIn: "1m",
        //   }
        // );
        // store the token in cookie
        res.cookie("access_token", accessToken, { maxAge: 1000 * 60 * 1 });
        res.sendStatus(200);
      } else {
        // user already exists
        // const accessToken = jwt.sign(
        //   { email, userId: isUserPresent._id },
        //   process.env.JWT_ACCESS_KEY,
        //   {
        //     expiresIn: "1m",
        //   }
        // );
        res.cookie("access_token", accessToken, { maxAge: 1000 * 60 * 1 });
        res.sendStatus(200);
      }
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  }
);

app.get("/protected",rbac(["user"]),  async (req, res) => {
  // https://www.googleapis.com/oauth2/v1/userinfo

  // check if the token is valid

  // -------------- Using axios -------------
  // const isGoogleTokenValid = await axios.get(
  //   "https://www.googleapis.com/oauth2/v1/userinfo",
  //   {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   }
  // );
  const token = req.cookies.access_token;
  // -------------- Using node-fetch -------------
  const isGoogleTokenValid = await fetch(
    "https://www.googleapis.com/oauth2/v1/userinfo",
    { headers: { Authorization: `Bearer ${token}` } }
  ).then((res) => res.json());
  // console.log(isGoogleTokenValid);
  if (isGoogleTokenValid) {
    res.send("protected data");
  } else {
    res.send("Unauthorized");
  }
});
app.listen(port, async (req, res) => {
  try {
    await connection;
    console.log("listening on port 8080");
  } catch (error) {
    console.log(error.message);
  }
});
