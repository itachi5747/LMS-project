// const { MailtrapClient } = require("mailtrap");
// require("dotenv").config();

// const TOKEN = process.env.MAILTRAP_TOKEN;

// const client = new MailtrapClient({ token: TOKEN });

// const sender = {
//   email: "hello@demomailtrap.co",
//   name: "Legend Nafay",
// };

// module.exports = { client, sender };


const nodemailer = require("nodemailer");
require("dotenv").config();

// Set up transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,   // your Gmail address
    pass: process.env.APP_PASS      // your Gmail App Password
  }
});

// Sender info
const sender = {
  email: process.env.MAIL_USER,
  name: "Legend Nafay"
};

module.exports = { transporter, sender };

