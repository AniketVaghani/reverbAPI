var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ViewTimestampSchema = new Schema({
  group: { type: Schema.Types.ObjectId, ref: "Group" },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

ViewTimestampSchema.index({ user: 1, group: 1 }, { unique: true })

//Export function to create "Post" model class
module.exports = mongoose.model("ViewTimestamp", ViewTimestampSchema);
