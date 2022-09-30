const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const { deleteImage } = require("../utils/ImageUpload");

var schema = new Schema(
  {
    mediaType: {
      type: String,
      enum: ["link", "image", "youtube"],
    },
    url: String,
  },
  { collection: "media" }
);

schema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    // if we need to clean echo the file from S3
    if (this.mediaType === "image") {
      deleteImage(this.url);
    }
    next();
  }
);

module.exports = mongoose.model("Media", schema);
