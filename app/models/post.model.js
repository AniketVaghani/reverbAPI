const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Media = require("./media.model");
var Reaction = require("./reaction.model");

var schema = new Schema(
  {
    contents: String,
    author: { type: Schema.Types.ObjectId, ref: "User" },
    group: { type: Schema.Types.ObjectId, ref: "Group" },
    media: { type: Schema.Types.ObjectId, ref: "Media" },
    threadParent: { type: Schema.Types.ObjectId, ref: "Post", index: true },
    reactions: [{ type: Schema.Types.ObjectId, ref: "Reaction" }],
  },
  {
    collection: "posts",
    discriminatorKey: "postType",
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true }, // So `console.log()` and other functions that use `toObject()` include virtuals
    timestamps: true,
  }
);

schema.index({ group: 1, createdAt: -1 }); // Create a joint index sorted by time for each group

schema.virtual("threadRoot").get(function () {
  let curRoot = this;
  while (curRoot.threadParent) {
    curRoot = curRoot.threadParent;
  }
  return curRoot._id;
});

function populatePostContents(next) {
  this.populate(["author", "group", "media"])
  .populate({
    path: "reactions",
    populate: {
      path: "author",
    },
  })
  // This is bad form, but there doesn't appear to be a way to inherit functions with discriminators
  .populate("echoAuthor");

  populateAncestor(this, next);
  populateEchoAncestor(this, next);
  next();
}

function populateAncestor(query, next) {
  query.populate('threadParent');
  next();
}

function populateEchoAncestor(query, next) {
  query.populate('echoParent');
  next();
}

// must be a method rather than a virtual because virtuals cannot be async
schema.methods.getReplies = async function() {
  let replies = await this.model("Post").find({ threadParent: this._id }).populate("author");
  //let authors = await replies.map(x => x.author);
  return replies;
};

// must be a method rather than a virtual because virtuals cannot be async
schema.methods.getEchoes = async function() {
  let replies = await this.model("EchoPost").find({ echoParent: this._id }).populate("echoAuthor");
  //let authors = await replies.map(x => x.author);
  return replies;
};

schema.pre('findOne', populatePostContents)
  .pre('find', populatePostContents);

// When the post is deleted, also remove any dependent objects such as reactions and echoPosts
schema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    if (this.media && this.postType != "EchoPost") {
      let media = await Media.findById({ _id: this.media._id });
      await media.deleteOne();
    }
    await Reaction.deleteMany({ post: this._id }).exec();
    // EchoPost can't be defined at the top of this file since it depends on this file being imported first, so we have to import it here after Post has been defined
    var EchoPost = require("./echopost.model");
    await EchoPost.deleteMany({ echoParent: this._id }).exec();

    next();
  }
);

module.exports = mongoose.model("Post", schema);
