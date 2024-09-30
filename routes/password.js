const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");


router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const secret = process.env.JWT_SECRET + user.password;

    const token = jwt.sign({ email: user.email, id: user._id }, secret, {
      expiresIn: "30m",
    });

    const link = `${process.env.FRONTEND_URL}/reset-password/${user._id}/${token}`;

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    var mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${user.username || "User"},</p>
        
        <p>We received a request to reset your password for your account associated with this email address: ${user.email}.</p>
        
        <p>To reset your password, please click the button below:</p>
        
        <p>
          <a href="${link}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
    
        <p>If you did not request a password reset, please ignore this email. Your password will not be changed until you click the button above and create a new password.</p>
    
        <p>For security reasons, this link will expire in 30 minutes. If you need a new password reset link, you can request another one through the password reset page.</p>
    
        <p>If you have any questions or need further assistance, please don’t hesitate to reach out.</p>
    
        <p>Thank you,<br/>Thinker</p>
      `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to send email." }); 
      } else {
        console.log("Email sent: " + info.response);
        return res.status(200).json({
          message:
            "Please check your email, a reset link has been sent to you.",
        });
      }
    });

    console.log(link);
  } catch (error) {
    console.log(error);
  }
});


router.post("/reset-password/:id/:token", async (req, res) => {
  try {
    const { id, token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const secret = process.env.JWT_SECRET + user.password;

    try {
      jwt.verify(token, secret);
    } catch (err) {
      console.log(err)
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const encryptPassword = await bcrypt.hash(password, 10);

    await User.updateOne({ _id: id }, { $set: { password: encryptPassword } });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const { currentPassword, newPassword } = req.body;

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid current password" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
