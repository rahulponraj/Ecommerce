const mongoose = require("mongoose");

const TempSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
  }
)
module.exports = mongoose.model("TempData", TempSchema);