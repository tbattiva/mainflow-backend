const mongoose = require("mongoose");

const Host = mongoose.model(
  "Host",
  new mongoose.Schema({
    name: String,
    ip: String,
    port: Number,
    description: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    creation: Date,
    modified: Date
  })
);

module.exports = Host;