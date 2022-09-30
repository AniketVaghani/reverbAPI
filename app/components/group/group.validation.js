const { createValidationResponse } = require("../../utils/helpers");
const { isEmpty, isPassword } = require("../../utils/validator");

class GroupValidator {
  getUserGroup(req, res, next) {
    const errors = {};
    const { userId } = req.body;

    if (isEmpty(userId)) {
      errors.userId = "UserId is required";
    }

    if (Object.keys(errors).length > 0) {
      createValidationResponse(res, errors);
    } else {
      next();
    }
  }

  joinGroup(req, res, next) {
    const errors = {};
    const { groupName, userId } = req.body;

    if (isEmpty(groupName)) {
      errors.groupName = "GroupName is required";
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
}

const groupValidatorObj = new GroupValidator();
module.exports = groupValidatorObj;
