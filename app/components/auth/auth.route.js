const express = require("express");
const { uploadImage } = require("../../utils/ImageUpload");
const authController = require("../auth/auth.controller");
const authValidation = require("../auth/auth.validation");
const router = express.Router();
router.post(
  "/register",
  async (req, res, next) => {
    uploadImage("profile").single("profileImage")(req, res, next);
  },
  authValidation.create,
  (req, res, next) => {
    authController.create(req, res, next);
  }
);

router.post("/verify", authValidation.verify, (req, res) => {
  authController.verify(req, res);
});

router.post("/login", authValidation.login, (req, res) => {
  authController.login(req, res);
});
module.exports = router;
