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
      ...(req.body.newPassword && { password: req.body.newPassword }),

      // Add other fields as needed
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true }
    );

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
      return res.status(404).json("No posts found for this user");
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
