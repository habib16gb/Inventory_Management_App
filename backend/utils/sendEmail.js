import nodemailer from "nodemailer";
import asyncHandler from "express-async-handler";

const sendEmail = async (sub, message, send_to, send_from, reply_to) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const options = {
    from: send_from,
    to: send_to,
    replyTo: reply_to,
    subject: sub,
    html: message,
  };

  transporter.sendMail(options, function (err, info) {
    err ? console.error(err) : console.log(info);
  });
};

export default sendEmail;
