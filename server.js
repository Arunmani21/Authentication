//jshint esversion :6
const express = require('express');
const mongoose = require('mongoose');
const app = express();

mongoose.connect(
  "mongodb://localhost:27017/",
  {
    dbName: "Tokentransfer",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) =>
    err ? console.log(err) : console.log(
      "Connected to your database")
);
app.use(express.urlencoded({extended: true}));

app.use(express.json());

const authRouter = require('./routes/auth');

const userRouter = require('./routes/user');

app.use("/auth", authRouter);

app.use("/user", userRouter);

app.listen(3000, () => {
    console.log(`Example app listening on port 8000`);
  });