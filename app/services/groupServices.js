const Group = require("../models/group.model");

class GroupService {
  async joinGroup(payload) {
    try {
      const { groupName, userId } = payload;
      let groupItem = await Group.findOne({ name: groupName });
      if (groupItem) {
        const checkUser = groupItem.members.includes(userId);
        if (!checkUser) {
          await groupItem.members.push(userId);
          groupItem.save();
        } else {
          throw Error("User already joined this group");
        }
      } else {
        throw Error("Invalid group");
      }
      return true;
    } catch (err) {
      throw err;
    }
  }

  async getJoinGroups(payload, query) {
    try {
      const { searchGroup } = query;
      const { userId } = payload;
      const search = searchGroup ? searchGroup : "";
      let groupItem = await Group.find({
        members: { $nin: userId },
        name: { $regex: `${search}`, $options: "i" },
      }).populate({
        path: "members",
        populate: {
          path: "user",
        },
      });
      return groupItem;
    } catch (err) {
      throw err;
    }
  }
}

const groupService = new GroupService();
module.exports = groupService;
