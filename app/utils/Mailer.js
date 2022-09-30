var nodemailer = require("nodemailer");
const aws = require("aws-sdk");

const ses = new aws.SES({
  apiVersion: "2010-12-01",
});

// create Nodemailer SES transporter
let transporter = nodemailer.createTransport({
  SES: { ses, aws },
});

/**
 * Sends email
 * mailOptions = {
 * to: to,
 * from: 'reverb@cs.stanford.edu',
 * subject: subject,
 * text: body,
 * html: body,
 * ses: {
 *  Tags: [
 *    {
 *      Name: "tag_name",
 *      Value: "tag_value",
 *    },
 *  ],
 * },
 * }
 **/
const sendMail = (mailOptions) => {
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error, "Mailer Error");
    } else {
      console.log("Message sent:");
      console.log(info.envelope);
      console.log(info.messageId);
    }
  });
};

exports.sendMail = sendMail;
exports.emailAddress = "Curio <curio@cs.stanford.edu>";
