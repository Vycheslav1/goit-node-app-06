const sgMail = require("@sendgrid/mail");

require("dotenv").config();

sgMail.setApiKey(process.env.SG_API_KEY);

const message = {
  to: "slavastetsenko@gmail.com",
  from: "slavastetsenko@gmail.com",
  subject: "I love Node.js",
  html: "<h1>Node.js is a good platform</h1>",
  text: "Node.js is a good platform",
};

sgMail
  .send(message)
  .then((response) => console.log(response))
  .catch((error) => console.log(error));
