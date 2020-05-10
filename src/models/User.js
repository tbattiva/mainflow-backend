const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: String,
    email: String,
    username: String,
    password: String,
    birth: Date,
    company: String,
    github: String,
    creation: Date,
    modified: Date
  })
);

module.exports = User;