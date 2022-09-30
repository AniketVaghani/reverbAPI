var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var uniqueValidator = require("mongoose-unique-validator");

// TODO: make UserVerification and PasswordReset both discriminators on a Token object

var UserVerificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    createdAt: { type: Date, expires: "24h", default: Date.now },
    token: {
      unique: true,
      type: String,
      required: true,
    },
  },
  { collection: "userverifications" }
);

UserVerificationSchema.plugin(uniqueValidator);

//Export function to create "Post" model class
module.exports = mongoose.model("UserVerification", UserVerificationSchema);
