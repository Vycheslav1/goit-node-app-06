const nodemailer = require("nodemailer");

require("dotenv").config();

const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAIL_TRAP_USER,
    pass: process.env.MAIL_TRAP_PASS,
  },
});

const message = {
  to: "slavastetsenko@gmail.com",
  from: "slavastetsenko@gmail.com",
  subject: "I love Node.js",
  html: "<h1>Node.js is a good platform</h1>",
  text: "Node.js is a good platform",
};

function sendMessage(message) {
  message.from = "slavastetsenko@gmail.com";
  return transport.sendMail(message);
}

module.exports = sendMessage;
