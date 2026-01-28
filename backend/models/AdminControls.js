const mongoose = require("mongoose");

const adminControlsSchema = new mongoose.Schema({
  allowEnrollment: {
    type: Boolean,
    default: true
  },
  allowDrop: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model("AdminControls", adminControlsSchema);