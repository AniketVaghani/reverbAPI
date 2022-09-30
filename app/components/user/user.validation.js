const { createValidationResponse } = require("../../utils/helpers");
const { isEmpty, isPassword } = require("../../utils/validator");

class UserValidator {
  changePassword(req, res, next) {
    const errors = {};
    const { oldPassword, newPassword } = req.body;
    const { token } = req.params;

    if (isEmpty(oldPassword || token)) {
      errors.oldPassword = "oldPassword or token is required";
    }

    if (isEmpty(newPassword)) {
      errors.newPassword = "newPassword is required";
    }
    if (!isPassword(newPassword)) {
      errors.newPassword =
        "Password must be at least of 8 characters, including at least one uppercase, lowercase, and special character.";
    }

    if (Object.keys(errors).length > 0) {
      createValidationResponse(res, errors);
    } else {
      next();
    }
  }

  resetPassword(req, res, next) {
    const errors = {};
    const { username, email } = req.body;

    if (isEmpty(username || email)) {
      errors.token = "username or email is required";
    }

    if (Object.keys(errors).length > 0) {
      createValidationResponse(res, errors);
    } else {
      next();
    }
  }
}

const userValidationObj = new UserValidator();
module.exports = userValidationObj;
