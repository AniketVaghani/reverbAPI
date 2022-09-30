const express = require("express");
const postController = require("../post/post.controller");
const postValidation = require("../post/post.validation");
const router = express.Router();
const passport = require("passport");
const PassportErrorHandler = require("../../middleware/passportErrorResponse");
const { uploadImage } = require("../../utils/ImageUpload");

router.post(
  "/post",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  function (req, res, next) {
    // upload any attached images
    let user = req.user.username;
    uploadImage(user).single("file")(req, res, next);
  },
  postValidation.createPost,
  (req, res) => {
    postController.createPost(req, res);
  }
);

router.post(
  "/delete",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  (req, res) => {
    postController.deletePost(req, res);
  }
);

router.post(
  "/reaction/add",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  postValidation.addReaction,
  (req, res) => {
    postController.addReaction(req, res);
  }
);

router.post(
  "/reaction/remove",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  (req, res) => {
    postController.deleteReaction(req, res);
  }
);

router.post(
  "/media-og/",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  (req, res) => {
    postController.PostExternalLink(req, res);
  }
);

router.get(
  "/:group?",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  (req, res) => {
    postController.getGroupPosts(req, res);
  }
);

router.get(
  "/:group?/lastpost/:lastpost",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  (req, res) => {
    postController.getGroupPosts(req, res);
  }
);

router.get(
  "/:group/:post",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  (req, res) => {
    postController.getPost(req, res);
  }
);

router.post(
  "/echo",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  postValidation.echoPost,
  (req, res) => {
    postController.echoPost(req, res);
  }
);

router.post(
  "/echo/availability",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  postValidation.echoPostAvailability,
  (req, res) => {
    postController.echoPostAvailability(req, res);
  }
);

router.post(
  "/echoconsent",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  postValidation.echoConsent,
  (req, res) => {
    postController.echoConsent(req, res);
  }
);

module.exports = router;
