const { createValidationResponse } = require("../../utils/helpers");
const { isEmpty, isPassword } = require("../../utils/validator");

class PostValidator {
  createPost(req, res, next) {
    const errors = {};
    const { contents, group, userId } = req.body;
    const { file } = req;
    if (isEmpty(contents || file)) {
      errors.contents = "Contents or file is required";
    }

    if (isEmpty(group)) {
      errors.group = "Group is required";
    }
    if (isEmpty(userId)) {
      errors.userId = "UserId is required";
    }

    if (Object.keys(errors).length > 0) {
      createValidationResponse(res, errors);
    } else {
      next();
    }
  }

  addReaction(req, res, next) {
    const errors = {};
    const { postId, userId, emoji } = req.body;
    if (isEmpty(postId)) {
      errors.postId = "PostId is required";
    }

    if (isEmpty(userId)) {
      errors.userId = "UserId is required";
    }
    if (isEmpty(emoji)) {
      errors.emoji = "Emoji is required";
    }

    if (Object.keys(errors).length > 0) {
      createValidationResponse(res, errors);
    } else {
      next();
    }
  }

  echoPost(req, res, next) {
    const errors = {};
    const { postId, userId, group } = req.body;
    if (isEmpty(postId)) {
      errors.postId = "PostId is required";
    }

    if (isEmpty(userId)) {
      errors.userId = "UserId is required";
    }
    if (isEmpty(group)) {
      errors.group = "GroupId is required";
    }

    if (Object.keys(errors).length > 0) {
      createValidationResponse(res, errors);
    } else {
      next();
    }
  }

  echoPostAvailability(req, res, next) {
    const errors = {};
    const { postId } = req.body;

    if (isEmpty(postId)) {
      errors.postId = "PostId is required";
    }

    if (Object.keys(errors).length > 0) {
      createValidationResponse(res, errors);
    } else {
      next();
    }
  }

  echoConsent(req, res, next) {
    const errors = {};
    const { token } = req.body;

    if (isEmpty(token)) {
      errors.token = "token is required";
    }

    if (Object.keys(errors).length > 0) {
      createValidationResponse(res, errors);
    } else {
      next();
    }
  }
}

const postValidationObj = new PostValidator();
module.exports = postValidationObj;
