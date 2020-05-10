const mongoose = require("mongoose");

const Phase = mongoose.model(
  "Phase",
  new mongoose.Schema({
    name: String,
    description: String,
    type: Number,
    object: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    nextPhaseCondition: [String],
    seqNum: Number,
    flowId:String,
    creation: Date,
    modified: Date
  })
);

module.exports = Phase;