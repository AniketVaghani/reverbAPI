const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Post = require("./post.model");

var EchoPost = Post.discriminator(
  "EchoPost",
  new Schema({
    echoParent: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    echoAuthor: { type: Schema.Types.ObjectId, ref: "User", required: true },
  })
); // note that .discriminator returns a Model, not a Schema
module.exports = mongoose.model("EchoPost");
