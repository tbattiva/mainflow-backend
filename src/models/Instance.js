const mongoose = require("mongoose");

const Instance = mongoose.model(
  "Instance",
  new mongoose.Schema({
    starttime: Date,
    endtime: Date,
    flowId: String,
    status: String,
    phase: Number,
    size: Number,
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    } ,
    phaseOutput:[]
  })
);

module.exports = Instance;
