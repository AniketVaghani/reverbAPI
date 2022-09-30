var Post = require("../models/post.model");
var EchoPost = require("../models/echopost.model");
const { groupBy } = require("../utils/helpers");

const rank = (posts) => {
  let ranked = [];

  // pick one per threadRoot
  // TODO: pick intelligently which one per threadroot

  // do a depth first traversal of the threadRoot and select the thread that has the most interactions (I know this is not great, but it's a first implementation)
  let grouped = groupBy(posts, "threadRoot");
  let threadRootIds = Object.keys(grouped);
  ranked = threadRootIds.map((item) => {
    let root = grouped[item];
    let maxInteractions = 0;
    let maxPost = root[0];
    root.forEach((item) => {
      let interactions = countInteractions(item);
      if (interactions > maxInteractions) {
        maxPost = r;
        maxInteractions = interactions;
      }
    });
    return maxPost;
  });

  // sort the threads by reverse chronological order
  ranked.sort(function (a, b) {
    return b.createdAt - a.createdAt;
  });

  return ranked;
};

const countInteractions = async (post) => {
  let replyCount = await Post.find({ threadParent: post._id }).countDocuments();
  let echoCount = await EchoPost.find({
    echoParent: post._id,
  }).countDocuments();

  let reactionCount = post.reactions.length;

  let children = await Post.find({ threadParent: post._id });
  let childrenTotal = 0;

  for (let i = 0; i < children.length; i++) {
    let childTotal = await countInteractions(children[i]);
    childrenTotal = childrenTotal + childTotal;
  }

  let total = replyCount + echoCount + reactionCount + childrenTotal;

  //console.log(`post ${post._id}: ${replyCount} replies, ${echoCount} echoes, ${reactionCount} reactions, ${childrenTotal} children interactions. Total: ${total}`);
  return total;
};

module.exports = rank;
