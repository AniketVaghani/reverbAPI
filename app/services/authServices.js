const User = require("../models/auth.model");
const UserVerification = require("../models/userverification.model");
const filteredBody = require("../utils/filteredBody");
const constants = require("../config/constants");
var Mailer = require("../utils/Mailer");
const crypto = require("crypto");
const { CLIENT_CORS } = require("../config/env");

class AuthService {
  createUser(obj) {
    return new Promise(async (resolve, reject) => {
      try {
        const body = filteredBody(obj.body, constants.WHITELIST.user.register);
        body.email = String(body.email).toLowerCase();
        User.findOne(
          {
            email: body.email,
          },
          (err, existingUser) => {
            if (err) {
              reject(err);
              return;
            }
            if (existingUser) {
              reject({
                message: "That email is already in use.",
              });
              return;
            }

            const user = new User({
              ...body,
              profileImage: obj.file.location,
            });

            user.save(async (err2, item) => {
              if (err2) {
                reject(err2);
                return;
              }

              await this.createUserVerification(item);
              resolve(item.toJSON());
            });
          }
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  async createUserVerification(user) {
    let userVerification = await UserVerification.findOne({ user: user._id });
    if (!userVerification) {
      userVerification = new UserVerification({
        user: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      });

      userVerification.save();
    }

    const link = `${CLIENT_CORS}/account/verify/${userVerification.token}`;
    let mailOptions = {
      from: Mailer.emailAddress,
      to: user.email,
      subject: "Curio account verification",
      text: `To verify your Curio account, please follow this link: ${link}`,
      ses: {
        // optional extra arguments for SendRawEmail
        Tags: [
          {
            Name: "type",
            Value: "userverification",
          },
        ],
      },
    };
    // TODO: send an email to reset the password
    Mailer.sendMail(mailOptions);
  }

  async verifyUser(payload) {
    const { verificationToken } = payload;
    const reset = await UserVerification.findOne({
      token: verificationToken,
    }).populate("user");

    if (reset) {
      const { _id } = reset.user;
      const promiseResult = await new Promise(async (resolve, reject) => {
        User.findOneAndUpdate(
          {
            _id: _id,
          },
          {
            accountVerified: true,
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

  async UserLogin(payload) {
    try {
      const { username, password } = payload;
      const user = await User.findOne({ username: username });
      if (user) {
        const { accountVerified } = user;
        if (!accountVerified) {
          throw Error(
            "Account is not verified. Please check your email for a message from curio@cs.stanford.edu and click on the verification link, then try logging in again."
          );
        }
        if (user && user.authenticateUser(password)) {
          return user.toAuthJSON();
        }
      } else {
        throw Error(
          "Username or password is incorrect. Please check credentials and try again."
        );
      }
      return null;
    } catch (err) {
      throw err;
    }
  }
}

const authService = new AuthService();
module.exports = authService;
