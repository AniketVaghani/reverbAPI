const path = require("path");
const dotenv = require("dotenv");
/**
 * Load environment variables from .env file
 */
const envPostFix = process.env.APP_ENV ? `.${process.env.APP_ENV}` : "";
dotenv.config({
  path: path.resolve(__dirname, `../../.env${envPostFix}`),
});

module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  ENV: process.env.APP_ENV,
  PORT: process.env.PORT,
  DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING,
  EXPRESS_SECRET: process.env.EXPRESS_SECRET,
  MAX_RESPONSE_TIME: process.env.MAX_RESPONSE_TIME || 10000,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  CLIENT_CORS: process.env.CLIENT_CORS,
  SESSION_SECRET: process.env.SESSION_SECRET,
  COOKIE_SECRET: process.env.COOKIE_SECRET,
  SLACKBOT_WEBHOOK: process.env.SLACKBOT_WEBHOOK,
};
