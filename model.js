//jshint esversion: 8
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        unique: true,
    },
    password:String,
    mnemonic: String,
    address: String
  });

  module.exports = mongoose.model("users", userSchema);