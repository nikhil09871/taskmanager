const nodemailer = require("nodemailer");

const sendResetEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetURL = `http://localhost:5173/reset-password/${token}`;

  await transporter.sendMail({
    from: '"Your App" <yourapp@example.com>',
    to: email,
    subject: "Password Reset Request",
    html: `<p>Click <a href="${resetURL}">here</a> to reset your password. The link expires in 1 hour.</p>`,
  });
};

module.exports = sendResetEmail;
