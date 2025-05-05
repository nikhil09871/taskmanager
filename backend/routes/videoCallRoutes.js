const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

// Example transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/send-invites', async (req, res) => {
  const { emails } = req.body;
  const roomId = uuidv4(); // unique meeting room

  try {
    const sendEmails = emails.map(email => {
      const link = `http://localhost:5173/videocall/${roomId}`;
      return transporter.sendMail({
        from: '"Task Manager" <yourgmail@gmail.com>',
        to: email,
        subject: "You're invited to a video call",
        html: `<p>You have been invited to join a video call. Click <a href="${link}">here</a> to join.</p>`
      });
    });

    await Promise.all(sendEmails);
    res.status(200).json({ message: "Invites sent successfully", roomId });
  } catch (err) {
    console.error("Mail error:", err);
    res.status(500).json({ message: "Failed to send invites" });
  }
});

module.exports = router;
