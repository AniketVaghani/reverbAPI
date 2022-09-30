/**
 * Init All routes here
 */
const auth = require("../components/auth/auth.route");
const user = require("../components/user/user.route");
const group = require("../components/group/group.route");
const posts = require("../components/post/post.route");

module.exports = (app) => {
  app.use("/api/auth", auth);
  app.use("/api/user", user);
  app.use("/api/users", group);
  app.use("/api/posts", posts);
};
