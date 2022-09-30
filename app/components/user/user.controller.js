const { createError, createResponse } = require("../../utils/helpers");
const UserServices = require("../../services/userServices");

class UserController {
  async changePassword(req, res) {
    const { token } = req.params;
    try {
      const data = token
        ? await UserServices.ChangePasswordWithToken(token, req.body)
        : await UserServices.UserChangePassword(req.body, req.user);
      if (data) {
        createResponse(res, true, "Your new password has been set.");
      }
    } catch (err) {
      createError(res, {
        message: err.message,
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const data = await UserServices.UserResetPassword(req.body);
      if (data) {
        createResponse(res, true, "Reset Password Email Sent Successfully ");
      }
    } catch (err) {
      createError(res, {
        message:
          err.message ||
          "Unable to send email for password reset. Please try again.",
      });
    }
  }

  async addtoken(req, res) {
    try {
      await UserServices.storetoken(req.body, req.user)
        createResponse(res, true, "token add Successfully ");
    } catch (err) {
      createError(res, {
        message:
          err.message ||
          "token add Unsccessfully. Please try again.",
      });
    }
  }

  async deletetoken(req, res) {
    try {
      await UserServices.deletetokens(req.body, req.user)
        createResponse(res, true, "token delete Successfully ");
    } catch (err) {
      createError(res, {
        message:
          err.message ||
          "token delete Unsccessfully. Please try again.",
      });
    }
  }
}

const userController = new UserController();
module.exports = userController;
