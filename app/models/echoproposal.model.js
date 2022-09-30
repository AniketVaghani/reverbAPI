const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var uniqueValidator = require("mongoose-unique-validator");

var schema = new Schema({
  approved: {
    type: Schema.Types.Boolean,
    default: false,
  },
  token: {
    unique: true,
    type: String,
    required: true,
  },
  echoParent: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  echoAuthor: { type: Schema.Types.ObjectId, ref: "User", required: true },
  group: { type: Schema.Types.ObjectId, ref: "Group" },
});
schema.plugin(uniqueValidator);

module.exports = mongoose.model("EchoPostProposal", schema);
