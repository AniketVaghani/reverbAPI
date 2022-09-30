const User = require("../models/auth.model");
const Group = require("../models/group.model");
const Post = require("../models/post.model");
const Media = require("../models/media.model");
const Reaction = require("../models/reaction.model");
const linkify = require("linkify-it")();
linkify.tlds(require("tlds"));
const { CLIENT_CORS } = require("../config/env");
const ogs = require("open-graph-scraper");
const rank = require("../controllers/rank");
var EchoPost = require("../models/echopost.model");
var EchoPostProposal = require("../models/echoproposal.model");
var ViewTimestamp = require("../models/viewTimestamp.model");
const crypto = require("crypto");
var Mailer = require("../utils/Mailer");
const axios = require('axios');
const { SLACKBOT_WEBHOOK } = require("../config/env");

const POSTS_PER_LOAD = 7;

class PostService {
  async createPost(obj) {
    try {
      const { contents, threadParent, group, userId } = obj.body;
      const { file } = obj;
      let groupItem = await Group.findOne({ name: group });
      const checkUser = groupItem.members.includes(userId);
      if (!checkUser) {
        throw Error(`You are not a member of this group. You can't Post here`);
      }
      let user = await User.findOne({ _id: userId });

      let post = new Post({
        contents: contents,
        author: user._id,
        group: groupItem._id,
      });

      if (threadParent) {
        post.threadParent = threadParent;
      }

      if (file) {
        const media = new Media({
          mediaType: "image",
          url: file.location,
        });
        await media.save();
        post.media = media._id;
      }

      if (post.media === undefined && linkify.test(contents)) {
        const url = linkify.match(contents)[0];

        const media = new Media({
          url: url.url,
        });

        const youtubeRegex =
          /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
        if (youtubeRegex.test(url.url)) {
          media.mediaType = "youtube";
          let match = url.url.match(youtubeRegex);
          let videoId = match[1];
          media.url = "https://www.youtube.com/embed/" + videoId;
        } else {
          media.mediaType = "link";
        }

        if (String(media.mediaType) === "link") {
          const data = await this.PostExternalLink(media);
          if (data) {
            await media.save();
          }
        } else {
          await media.save();
        }
        post.media = media._id;
      }

      await post.save();

      let response = {
        id: post._id,
        author: post.author._id,
        group: post.group._id,
        contents: post.contents,
      };

      if (post.media) {
        const newMedia = await Media.findOne({ _id: post.media });
        response.media = newMedia.url;
      }
      return response;
    } catch (err) {
      throw err;
    }
  }

  async notifyPost(postId, groupId, authorId, isEcho = false) {
    let group = await Group.findOne({ _id: groupId } );
    let author = await User.findOne({ _id: authorId } );
    // let post = await Post.findOne({ _id: postId } );

    let textDescription = isEcho ? "Echo" : "new post"

    let link = `${CLIENT_CORS}/group/${group.name}`;
    let mrkdwn = `*<${link}|${group.name}>*: ${textDescription}\nby ${author.displayName}\n\n<${link}>`;

    let accessory = {
      "type": "image",
      "image_url": author.profileImage,
      "alt_text": author.displayName,
    }

    // let media, accessory;
    // if (postResponse['media']) {
    //   media = await Media.findOne({ _id: postResponse['media']} );
    //   if (media.type == 'image') {
    //     accessory = {
    //       "type": "image",
    //       "image_url": media.url,
    //       "alt_text": "alt text for image"
    //     }
    //   } else if (media.type == 'youtube' || media.type == 'url') {
    //     mrkdwn = mrkdwn + `\n\n${media.url}`
    //   }
    // }

    await axios.post(SLACKBOT_WEBHOOK, {
      "blocks": [
    		{
    			"type": "section",
    			"text": {
    				"type": "mrkdwn",
    				"text": mrkdwn,
    			},
    			"accessory": accessory,
    		}
    	]
    });
  }

  async deletePost(payload, user) {
    try {
      const { postId } = payload;
      const post = await Post.findOne({
        _id: postId,
      });

      if (String(post.author._id) === String(user._id)) {
        // it's their post, they can delete it
        await post.deleteOne();
      } else {
        throw Error("User does not own the post that was deleted");
      }
      return true;
    } catch (err) {
      throw err;
    }
  }

  async addReaction(payload) {
    try {
      const { postId, userId, emoji } = payload;
      const post = await Post.findOne({ _id: postId });
      const user = await User.findOne({ _id: userId });
      const { reactions } = post;

      const reaction = new Reaction({
        emoji: emoji,
        post: post._id,
        author: user._id,
      });

      let result = await Reaction.findOne({
        emoji: emoji,
        post: postId,
        author: userId,
      });

      if (!result) {
        await reaction.save();

        reactions.push(reaction);

        await post.save();

        const data = {
          reaction: reaction._id,
          post: post,
        };

        return data;
      } else {
        throw Error("You have already added this reaction on this post.");
      }
    } catch (err) {
      throw err;
    }
  }

  async deleteReaction(payload) {
    try {
      const { postId, userId, emoji } = payload;

      const data = await Reaction.deleteOne({
        post: postId,
        author: userId,
        emoji: emoji,
      });

      return data;
    } catch (err) {
      throw err;
    }
  }

  async PostExternalLink(payload) {
    try {
      const { url } = payload;
      let urlLink = new URL(url);
      if (urlLink.origin === `${CLIENT_CORS}`) {
        return {};
      } else {
        let options = { url: url };
        const data = await ogs(options);
        const { result } = data;
        return result;
      }
    } catch (err) {
      throw err;
    }
  }

  async getGroupPosts(user, group, paginationLastPost) {
    try {
      let user_groups;
      if (!group) {
        user_groups = await Group.find({ members: user });
      } else {
        user_groups = [await Group.findOne({ name: group })];
      }

      let postCriteria = {
        group: user_groups,
      };

      // only update the new post unread timestamp if we're not scrolling backwards through time and paginating
      let paginationTimestamp, unread_timestamp;
      if (!paginationLastPost) {
        let timestamp = Date.now();

        unread_timestamp = await ViewTimestamp.findOneAndUpdate(
          { user: user, group: user_groups },
          { timestamp: timestamp },
          { upsert: true, new: true }
        );
      } else {
        let paginationPost = await Post.findOne( { _id: paginationLastPost });
        paginationTimestamp = paginationPost.createdAt;
        postCriteria.createdAt = {
          "$lt": paginationTimestamp,
        };
      }

      let group_posts = await Post.find(postCriteria)
        .sort({
          createdAt: -1,
        })
        .limit(POSTS_PER_LOAD);

      // Search all reply descendants to each post, looking to see if they
      // are more recent than the timestamp we care about, since that would mean
      // that they were already sent in an earlier set of posts
      if (paginationLastPost) {
        // [true, false, true, true] where each entry is true if the client hasn't seen it yet
        let keepPosts = await Promise.all(group_posts.map(async (post) => {
          let mostRecent = await this.getMostRecentChildCreationTimestamp(post);
          return mostRecent < paginationTimestamp;
        }))

        // filter the group posts array based on whether we keep each one
        group_posts = group_posts.filter((post, index) => keepPosts[index]);
      }

      const ranked = rank(group_posts);

      // Mongoose does not allow us to create virtuals that
      // are async, so we have to add replies and echoes
      // afterwards instead of relying on toJSON().
      const ranked_JSON = await Promise.all(
        ranked.map(this.createPostJSON, this)
      );

      // only update the new post unread timestamp if we're not scrolling backwards through time and paginating
      if (!paginationLastPost) {
        await unread_timestamp.save();
      }
      return ranked_JSON;
    } catch (err) {
      throw err;
    }
  }

  async createPostJSON(post) {
    let postJSON = post.toJSON();
    await this.checkDeletedParent(postJSON);

    // get extra metadata, and do it recursively for parents
    let curPostData = async (curPost, curJSON) => {
      if (!curPost) return;
      curJSON["replies"] = await curPost.getReplies();
      curJSON["echos"] = await curPost.getEchoes();
      await curPostData(curPost.threadParent, curJSON["threadParent"]);
    };

    await curPostData(post, postJSON);
    return postJSON;
  }

  async getMostRecentChildCreationTimestamp(post) {

    // get all replies
    let replies = await Post.find( { threadParent: post._id } );
    if (replies.length == 0) {
      return post.createdAt;
    } else {
      let replyTimestamps = await Promise.all(replies.map(async (child) => {
        let childTimestamp = await this.getMostRecentChildCreationTimestamp(child);
        return childTimestamp;
      }));
      let mostRecentChild = Math.max.apply(null, replyTimestamps);
      return mostRecentChild.createdAt;
    }
  }

  async getPost(groupName, postId) {
    try {
      const group = await Group.findOne({ name: groupName });
      const post = await Post.findOne({
        group: group,
        _id: postId,
      });
      if (!post) {
        throw Error("This post does not exist");
      }

      const postJSON = await this.createPostJSON(post);
      return postJSON;
    } catch (err) {
      throw err;
    }
  }

  async checkDeletedParent(post) {
    if (post.threadParent === null) {
      // null means it was deleted
      // We have to hit the database again to figure out what the threadParent originally was before population.
      let copy = await Post.findOne({ _id: post.id });
      post.threadParent = {
        _id: copy.id,
        deleted: true,
      };
    }
  }

  async echoPost(payload) {
    try {
      const { postId, userId, group } = payload;

      const post = await Post.findOne({ _id: postId }).populate([
        "group",
        "author",
      ]);

      let groupItem = await Group.findOne({ _id: group });
      let user = await User.findOne({ _id: userId });

      let ancestors = await this.GroupAncestors(post.group, userId);
      let descendants = await this.GroupDescendants(post.group, userId);

      const hasGroup = (element) => {
        return element._id.toString() === groupItem._id.toString();
      };

      const isAncestor = ancestors.some(hasGroup);
      const isDescendant = descendants.some(hasGroup);

      let body = {
        contents: post.contents,
        author: post.author._id,
        group: groupItem._id,
        // no threadParent, it's gotta stand on its own?
        echoParent: post._id,
        echoAuthor: user._id,
        // no reactions, it's a new post
      };

      if (post.media) {
        body.media = post.media._id;
      }

      let echoPost;
      // if it's a descendant, do it immediately
      if (isDescendant) {
        echoPost = new EchoPost(body);
      }
      // if it's an ancestor, we need consent
      else if (isAncestor) {
        body.token = crypto.randomBytes(32).toString("hex");
        echoPost = new EchoPostProposal(body);
      }
      await echoPost.save();

      // // ask for consent
      if (isAncestor) {
        const createUpConsent = async (echoProposal) => {
          const link = `${CLIENT_CORS}/echoconsent/${echoProposal.token}`;

          let consentor = post.author;
          let echoer = user;

          let mailOptions = {
            from: Mailer.emailAddress,
            to: consentor.email,
            subject: `Curio: ${echoer.displayName} would like to share your post with ${groupItem.name}`,
            text: `To consent to your post appearing in ${groupItem.name}, follow this link: ${link}\n\n${post.contents}\n${post.group.name}`,
            ses: {
              // optional extra arguments for SendRawEmail
              Tags: [
                {
                  Name: "type",
                  Value: "echoconsent",
                },
              ],
            },
          };
          // TODO: send an email to reset the password
          Mailer.sendMail(mailOptions);
        };

        await createUpConsent(echoPost);
      }

      let response = {
        id: echoPost._id,
        group: echoPost.group._id,
        author: echoPost.echoAuthor._id,
        isProposal: isAncestor,
      };

      return response;
    } catch (err) {
      throw err;
    }
  }

  async echoPostAvailability(payload) {
    try {
      const { postId, userId } = payload;
      const post = await Post.findOne({ _id: postId }).populate("group");
      const group = await Group.findOne({ _id: post.group })
        .populate("parent")
        .populate("children");

      let ancestors = await this.GroupAncestors(group, userId);
      let descendants = await this.GroupDescendants(group, userId);

      let response = {
        ancestors: ancestors,
        descendants: descendants,
      };
      return response;
    } catch (err) {
      throw err;
    }
  }

  async echoConsent(payload) {
    try {
      const { token } = payload;

      const echoProposal = await EchoPostProposal.findOne({
        token: token,
      }).populate(["echoParent", "echoAuthor", "group"]);

      if (echoProposal) {
        echoProposal["approved"] = true;
        await echoProposal.save();

        let echoPost = new EchoPost({
          contents: echoProposal.echoParent.contents,
          author: echoProposal.echoParent.author,
          group: echoProposal.group,
          // no threadParent, it's gotta stand on its own?
          echoParent: echoProposal.echoParent,
          echoAuthor: echoProposal.echoAuthor,
        });

        await echoPost.save();
        await echoProposal.delete();

        return echoPost;
      } else {
        throw Error(
          "This echo consent token does not exist. Please try a different token."
        );
      }
    } catch (err) {
      throw err;
    }
  }

  /*
   * Depth first search to get all descendants
   */
  async GroupDescendants(group, userId) {
    let descendants = [];

    let children = await Group.find({ parent: group._id });
    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      let child_descendants = await this.GroupDescendants(child);
      descendants = descendants.concat(child_descendants);
      descendants.push(child);
      let userGroupList = [];
      userGroupList = descendants
        .filter((x) => x.members.includes(userId))
        .map((x) => x);
      descendants = userGroupList;
    }

    return descendants;
  }

  /*
   * Get all ancestors
   */
  async GroupAncestors(group, userId) {
    let ancestors = [];

    let cur = group;
    while (cur.parent) {
      const parent = await Group.findOne({ _id: cur.parent });
      ancestors.push(parent);
      let userGroupList = [];
      userGroupList = ancestors
        .filter((x) => x.members.includes(userId))
        .map((x) => x);
      ancestors = userGroupList;
      cur = parent;
    }

    return ancestors;
  }
}

const postService = new PostService();
module.exports = postService;
