const express = require("express");
const userController = require("../user/user.controller");
const userValidation = require("../user/user.validation");
const router = express.Router();
const passport = require("passport");
const PassportErrorHandler = require("../../middleware/passportErrorResponse");

router.post(
  "/changepassword",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  userValidation.changePassword,
  (req, res) => {
    userController.changePassword(req, res);
  }
);

router.post(
  "/changepassword/:token?",
  userValidation.changePassword,
  (req, res) => {
    userController.changePassword(req, res);
  }
);

router.post("/resetpassword", userValidation.resetPassword, (req, res) => {
  userController.resetPassword(req, res);
}); 

router.post(
  "/Add",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],

  (req, res) => {
    userController.addtoken(req, res);
  }
);

router.delete(
  "/delete",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],

  (req, res) => {
    userController.deletetoken(req, res);
  }
);

module.exports = router;
