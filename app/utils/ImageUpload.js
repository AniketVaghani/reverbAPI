const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const dotenv = require("dotenv"); // .env file

dotenv.config(); // using .env

const BUCKET_NAME = "reverb-posts";

const s3 = new aws.S3();

/* https://levelup.gitconnected.com/file-upload-express-mongodb-multer-s3-7fad4dfb3789 */
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/gif"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type, only JPEG, GIF, and PNG is allowed!"),
      false
    );
  }
};

const upload = (user) =>
  multer({
    fileFilter,
    storage: multerS3({
      acl: "public-read",
      s3,
      bucket: BUCKET_NAME,
      metadata: function (req, file, cb) {
        cb(null, { user: user });
      },
      key: function (req, file, cb) {
        cb(null, Date.now().toString() + "-" + user);
      },
      // SET DEFAULT FILE SIZE UPLOAD LIMIT
      limits: { fileSize: 1024 * 1024 * 20 }, // 20MB
    }),
  });

const deleteFile = (url) => {
  let key = new URL(url).pathname.split("/").pop();
  console.log(`Key to delete: ${key}`);
  s3.deleteObject(
    {
      Bucket: BUCKET_NAME,
      Key: key,
    },
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
      }
    }
  );
};

exports.uploadImage = upload;
exports.deleteImage = deleteFile;
