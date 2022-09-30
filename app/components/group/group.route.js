const express = require("express");
const GroupController = require("../group/group.controller");
const GroupValidator = require("../group/group.validation");
const router = express.Router();
const passport = require("passport");
const PassportErrorHandler = require("../../middleware/passportErrorResponse");

router.post(
  "/groups",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  GroupValidator.getUserGroup,
  (req, res) => {
    GroupController.getUserGroup(req, res);
  }
);

router.post(
  "/searchGroups",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  GroupValidator.getUserGroup,
  (req, res) => {
    GroupController.getJoinGroups(req, res);
  }
);

router.post(
  "/groups/join",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  GroupValidator.joinGroup,
  (req, res) => {
    GroupController.joinGroup(req, res);
  }
);

router.get(
  "/groupByName/:groupName",
  [
    passport.authenticate("jwt", { session: false, failWithError: true }),
    PassportErrorHandler.success,
    PassportErrorHandler.error,
  ],
  (req, res) => {
    GroupController.groupByName(req, res);
  }
);

module.exports = router;