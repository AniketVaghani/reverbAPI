const { createError, createResponse } = require("../../utils/helpers");
const Group = require("../../models/group.model");
const User = require("../../models/auth.model");
const groupServices = require("../../services/groupServices");

class GroupController {
  async getUserGroup(req, res) {
    try {
      const { userId } = req.body;
      const user = await User.findById(userId);
      const user_groups = await Group.find({ members: user }).populate(
        "parent"
      );

      let groups = await Promise.all(user_groups.map(async (item) => {
        let group = item.toObject();
        group.hasUnread = await item.hasUnread(user);
        return group;
      }));

      if (groups.length > 0) {
        createResponse(res, "ok", "Group fetched successfully", groups);
      }
    } catch (err) {
      createError(res, {
        message: err.message,
      });
    }
  }

  async getJoinGroups(req, res) {
    try {
      const data = await groupServices.getJoinGroups(req.body, req.query);
      if (data) {
        createResponse(res, "ok", "Group fetched successfully", data);
      }
    } catch (err) {
      createError(res, {
        message: err.message,
      });
    }
  }

  async joinGroup(req, res) {
    try {
      const data = await groupServices.joinGroup(req.body);
      if (data) {
        createResponse(res, true, "Join group successfully ", data);
      }
    } catch (err) {
      createError(res, {
        message: err.message || "Unable to join group. Please try again.",
      });
    }
  }

  async groupByName(req, res) {
    try {
      const { groupName } = req.params;
      const data = await Group.findOne({ name: groupName });
      if (data) {
        createResponse(res, true, "Group fetched successfully", data);
      }
    } catch (err) {
      createError(res, {
        message: err.message || "Unable to group. Please try again.",
      });
    }
  }
}

const groupController = new GroupController();
module.exports = groupController;
