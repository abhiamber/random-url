const mongoose = require("mongoose");
const shortId = require("shortid");

const shortUrlSchema = new mongoose.Schema(
  {
    full: {
      type: String,
      required: true,
    },
    short: {
      type: String,
      required: true,
      unique: true,
      default: `http://localhost:5000/${shortId.generate()}`,
    },
    clicks: {
      type: Number,
      required: true,
      default: 0,
    },
    time: { type: String, default: Date.now() },
  },
  { timestamps: true }
);

let ShortUrlModel = mongoose.model("ShortUrl", shortUrlSchema);
module.exports = ShortUrlModel;
