module.exports = {
  // Admin Emails
  ADMIN_EMAILS: [""],
  WHITELIST: {
    user: {
      register: [
        "username",
        "displayName",
        "email",
        "profileImage",
        "accountVerified",
        "password",
      ],
      updateEmail: ["email"],
      updatePassword: ["password"],
    },
  },
};
