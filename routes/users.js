const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");
const bcrypt = require("bcrypt");

//UPDATE
router.put("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the provided password matches the current password
    const passwordMatch = await bcrypt.compare(
      req.body.currentPassword,
      user.password,
    );

    if (passwordMatch) {
      // If the password matches, proceed with the update
      if (req.body.newPassword) {
        // If a new password is provided, hash it
        const salt = await bcrypt.genSalt(10);
        req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt);
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            // Update only the fields that are provided
            ...(req.body.username && { username: req.body.username }),
            ...(req.body.email && { email: req.body.email }),
            ...(req.body.newPassword && { password: req.body.newPassword }),
            // Add other fields as needed
          },
        },
        { new: true },
      );

      res.status(200).json({
        message: "User updated successfully!",
        updatedUser,
      });
    } else {
      res.status(401).json("Incorrect password.");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      try {
        await Post.deleteMany({ username: user.username });
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("User has been deleted...");
      } catch (err) {
        res.status(500).json(err);
      }
    } catch (err) {
      res.status(404).json("User not found!");
    }
  } else {
    res.status(401).json("You can delete only your account!");
  }
});

//GET USER
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(200).json("User not found!");
    const { ...others } = user._doc;
    res.status(200).json(others);
  } catch {
    res.status(500).json(err);
  }
});

module.exports = router;
