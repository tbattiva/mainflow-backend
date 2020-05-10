const mongoose = require("mongoose");

const Flow = mongoose.model(
  "Flow",
  new mongoose.Schema({
    name: String,
    description: String,
    creation: Date,
    modified: Date,
    phases:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Phase"
      }
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    } 
  })
);

module.exports = Flow;
