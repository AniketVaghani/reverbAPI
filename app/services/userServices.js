const AuthServices = require("../services/authServices");
const User = require("../models/auth.model");
const PasswordReset = require("../models/passwordreset.model");
var Mailer = require("../utils/Mailer");
const crypto = require("crypto");
const { CLIENT_CORS } = require("../config/env");
const { comparePassword } = require("../utils/helpers/helpers");

class UserService {
  async UserChangePassword(payload, user) {
    const { oldPassword, newPassword } = payload;
    const { _id, password } = user;
    const checkPassword = comparePassword(oldPassword, password);
    if (checkPassword) {
      const promiseResult = await new Promise(async (resolve, reject) => {
        User.findOneAndUpdate(
          {
            _id: _id,
          },
          {
            password: newPassword,
          },
          { new: true },
          async (err) => {
            if (err) reject(err);
            return resolve(true);
          }
        );
      });
      return promiseResult;
    }
    throw Error("oldPassword is not correct");
  }

  async ChangePasswordWithToken(token, payload) {
    const { newPassword } = payload;

    let reset = await PasswordReset.findOne({ token: token }).populate("user");

    if (reset) {
      const { _id } = reset.user;
      const promiseResult = await new Promise(async (resolve, reject) => {
        User.findOneAndUpdate(
          {
            _id: _id,
          },
          {
            password: newPassword,
          },
          { new: true },
          async (err) => {
            if (err) reject(err);
            return resolve(true);
          }
        );
      });
      if (promiseResult) {
        reset.delete();
      }
      return promiseResult;
    }
    throw Error("Invalid token");
  }

  async UserResetPassword(payload) {
    let { username, email } = payload;
    try {
      email = String(email).toLowerCase();
      let user = await User.findOne({
        $or: [{ username: username }, { email: email }],
      });
      if (user) {
        const { _id } = user;
        let passwordReset = await PasswordReset.findOne({ user: _id });
        if (!passwordReset) {
          passwordReset = new PasswordReset({
            user: _id,
            token: crypto.randomBytes(32).toString("hex"),
          });

          passwordReset.save();
        }
        await this.createUserResetPasswordMail(email, passwordReset.token);
      } else {
        throw Error("username or email is not correct");
      }
      return true;
    } catch (err) {
      throw err;
    }
  }

  async createUserResetPasswordMail(email, resetToken) {
    const link = `${CLIENT_CORS}/account/changepassword/${resetToken}`;

    let mailOptions = {
      from: Mailer.emailAddress,
      to: email,
      subject: "Curio password reset",
      text: `To reset your password, please follow this link: ${link}`,
      ses: {
        // optional extra arguments for SendRawEmail
        Tags: [
          {
            Name: "type",
            Value: "passwordreset",
          },
        ],
      },
    };
    // TODO: send an email to reset the password
    Mailer.sendMail(mailOptions);
  }

  async storetoken({ fcmtoken }, user) {
    try {
      const promiseResult = await User.findOneAndUpdate(
        {
          _id: user._id
        },
        {
          $addToSet: { fcmtoken: fcmtoken }
        },
        { new: true },
      );
      return promiseResult;
    } catch (error) {
      throw Error("token not added");
    }
  }  
}

const userService = new UserService();
module.exports = userService;
