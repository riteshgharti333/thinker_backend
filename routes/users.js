const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");
const bcrypt = require("bcrypt");


router.put("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the email is being updated
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Check if a new password is provided and hash it
    if (req.body.newPassword) {
      const salt = await bcrypt.genSalt(10);
      req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt);
    }

    const updatedFields = {
      ...(req.body.username && { username: req.body.username }),
      ...(req.body.email && { email: req.body.email }),
      ...(req.body.profilepic && { profilepic: req.body.profilepic }),
      ...(req.body.newPassword && { password: req.body.newPassword }),
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true }
    );

    // Update the user's posts with new username or profile picture
    if (req.body.username || req.body.profilepic) {
      const updatePostFields = {};
      if (req.body.username) updatePostFields.username = req.body.username;
      if (req.body.profilepic) updatePostFields.userProfilePic = req.body.profilepic;

      await Post.updateMany(
        { userId: req.params.id },
        { $set: updatePostFields }
      );
    }

    res.status(200).json({
      message: "User updated successfully!",
      updatedUser,
    });
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


// GET ALL BLOGS OF A USER
router.get("/:userId/posts", async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId }).sort({ createdAt: -1 }).populate('username', 'username email');

    const postCount = await Post.countDocuments({ userId: req.params.userId });

    if (!posts.length) {
      return res.status(404).json({ message: "No posts found of this user" });
    }

    res.status(200).json({ postCount, posts });
  } catch (err) {
    res.status(500).json(err);
  }
});



// GET USER'S POSTS AND COUNT
router.get("/:userId/postcount", async (req, res) => {
  try {
    const posts = await Post.find({ username: req.params.userId }).sort({ createdAt: -1 }).populate('username', 'username email');
    if (!posts) {
      return res.status(404).json("No posts found for this user");
    }
    const postCount = posts.length; // Get the count of posts
    res.status(200).json({ postCount, posts });
  } catch (err) {
    res.status(500).json(err);
  }
});




module.exports = router;
