const { createError, createResponse } = require("../../utils/helpers");
const AuthServices = require("../../services/authServices");

class AuthController {
  async create(req, res) {
    try {
      const data = await AuthServices.createUser(req);
      if (data) {
        createResponse(res, true, "Email Sent Successfully", data);
      }
    } catch (err) {
      createError(res, {
        message: err.message || "Unable to create new user. Please try again",
      });
    }
  }

  async verify(req, res) {
    try {
      const data = await AuthServices.verifyUser(req.body);
      if (data) {
        createResponse(res, true, "Verified successfully.");
      }
    } catch (err) {
      createError(res, {
        message: err.message || "Unable to verify. Please try again.",
      });
    }
  }

  async login(req, res) {
    try {
      const data = await AuthServices.UserLogin(req.body);
      if (data) {
        createResponse(res, true, "Login success", data);
      } else {
        createError(res, {}, { message: "Invalid Credentials" });
      }
    } catch (err) {
      createError(res, {
        message: err.message,
      });
    }
  }
}

const authController = new AuthController();
module.exports = authController;
