const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Post = require("./post.model");
var ViewTimestamp = require("./viewTimestamp.model");

const schema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String
    },
    profileImage: {
      type: String,
    },
    members: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
    parent: { type: Schema.Types.ObjectId, ref: "Group", index: true },
  },
  { timestamps: true, usePushEach: true } // UTC format
);

schema.methods.hasUnread = async function (user) {
  // try {
  let group_timestamp = await ViewTimestamp.findOne({
    user: user,
    group: this,
  });

  if (!group_timestamp) {
    // They haven't seen the channel, return true
    return true;
  }
  let newest_post = await Post.findOne({ group: this._id }).sort({
    createdAt: -1,
  });
  if (newest_post) {
    return group_timestamp.timestamp < newest_post.createdAt;
  } else {
    return false;
  }
};

schema.virtual("children", {
  ref: "Group",
  localField: "_id",
  foreignField: "parent",
});

module.exports = mongoose.model("Group", schema);
