const { createError, createResponse } = require("../../utils/helpers");
const postServices = require("../../services/postServices");
const Reaction = require("../../models/reaction.model");

class PostController {
  async createPost(req, res) {
    try {
      const data = await postServices.createPost(req);
      if (data) {
        const slackData = await postServices.notifyPost(data['post'], data['group'], data['author']);
        createResponse(res, true, "Post added successfully ", data);
      }
    } catch (err) {
      createError(res, {
        message:
          err.message ||
          err.result.error ||
          "Unable to create post. Please try again.",
      });
    }
  }

  async deletePost(req, res) {
    try {
      const data = await postServices.deletePost(req.body, req.user);
      if (data) {
        createResponse(res, true, "Post deleted successfully ", data);
      }
    } catch (err) {
      createError(res, {
        message: err.message || "Unable to delete post. Please try again.",
      });
    }
  }

  async addReaction(req, res) {
    try {
      const data = await postServices.addReaction(req.body);
      if (data) {
        createResponse(res, true, "Reaction added successfully ", data);
      }
    } catch (err) {
      createError(res, {
        message: err.message || "Unable to add reaction. Please try again.",
      });
    }
  }

  async deleteReaction(req, res) {
    try {
      const data = await postServices.deleteReaction(req.body);

      if (data.deletedCount) {
        createResponse(res, true, "Reaction removed successfully");
      } else {
        createError(res, {
          message: "Reaction to delete not found.",
        });
      }
    } catch (err) {
      createError(res, {
        message: err.message || "Unable to remove reaction. Please try again.",
      });
    }
  }

  async PostExternalLink(req, res) {
    try {
      const data = await postServices.PostExternalLink(req.body);
      if (data) {
        createResponse(res, true, "External Link added successfully", data);
      }
    } catch (err) {
      createError(res, {
        message:
          err.message ||
          err.result.error ||
          "Unable to add external link. Please try again.",
      });
    }
  }

  async getGroupPosts(req, res) {
    try {
      const { group, lastpost } = req.params;
      const data = await postServices.getGroupPosts(req.user, group, lastpost);
      if (data) {
        createResponse(res, true, "Get group post successful", data);
      }
    } catch (err) {
      createError(res, {
        message: err.message || "Unable to get group posts. Please try again.",
      });
    }
  }

  async getPost(req, res) {
    try {
      const { group, post } = req.params;
      const data = await postServices.getPost(group, post);
      if (data) {
        createResponse(res, true, "get single group post successfully", data);
      }
    } catch (err) {
      createError(res, {
        message: err.message || "Unable to get post. Please try again.",
      });
    }
  }

  async echoPost(req, res) {
    try {
      const data = await postServices.echoPost(req.body);
      if (data) {
        if (!data['isProposal']) {
          const slackData = await postServices.notifyPost(data['post'], data['group'], data['author'], true);
        }
        createResponse(res, true, "Post echoed successfully.", data);
      }
    } catch (err) {
      createError(res, {
        message: err.message || "Unable to echo post. Please try again.",
      });
    }
  }

  async echoPostAvailability(req, res) {
    try {
      const data = await postServices.echoPostAvailability(req.body);
      if (data) {
        createResponse(
          res,
          true,
          "Checking echo availability successful",
          data
        );
      }
    } catch (err) {
      createError(res, {
        message:
          err.message || "Unable to check echo availability. Please try again.",
      });
    }
  }

  async echoConsent(req, res) {
    try {
      const data = await postServices.echoConsent(req.body);
      if (data) {
        const slackData = await postServices.notifyPost(data._id, data.group._id, data.echoAuthor._id, true);
        createResponse(res, true, "Recorded echo consent successfully.", data);
      }
    } catch (err) {
      createError(res, {
        message:
          err.message || "Unable to record echo consent. Please try again.",
      });
    }
  }
}

const postController = new PostController();
module.exports = postController;
