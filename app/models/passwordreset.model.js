var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var uniqueValidator = require("mongoose-unique-validator");

var PasswordResetSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    createdAt: { type: Date, expires: "6h", default: Date.now },
    token: {
      unique: true,
      type: String,
      required: true,
    },
  },
  { collection: "passwordresets" }
);

PasswordResetSchema.plugin(uniqueValidator);

//Export function to create "Post" model class
module.exports = mongoose.model("PasswordReset", PasswordResetSchema);
