const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var schema = new Schema(
  {
    emoji: String,
    post: { type: Schema.Types.ObjectId, ref: "Post", index: true },
    author: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    collection: "reactions",
    timestamps: true,
  }
);

// Emoji + Post + Author must be jointly unique
schema.index({ emoji: 1, author: 1, post: 1 }, { unique: true });

module.exports = mongoose.model("Reaction", schema);
