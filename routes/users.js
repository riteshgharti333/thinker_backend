const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");

router.put("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    const updatedFields = {
      ...(req.body.username && { username: req.body.username }),
      ...(req.body.email && { email: req.body.email }),
      ...(req.body.profilepic && { profilepic: req.body.profilepic }),
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true },
    );

    // Update the user's posts

    if (req.body.username) {
      await Post.updateMany(
        { userId: req.params.id },
        { $set: { username: req.body.username } },
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
      console.log(err)
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

    if (!user) return res.status(404).json("User not found!");
    const { ...others } = user._doc;
    res.status(200).json(others);
  } catch(err) {
    res.status(500).json(err);
  }
});

// GET ALL BLOGS OF A USER
router.get("/:userId/posts", async (req, res) => {
  try {
    // Find the user by userId
    const user = await User.findById(req.params.userId);

    // Check if the user exists
    if (!user) return res.status(404).json("User not found!");

    // Fetch all posts for the given userId
    const posts = await Post.find({ userId: req.params.userId });

    // Count the number of posts
    const postCount = posts.length;

    // Return the count and posts
    res.status(200).json({ postCount, posts });
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET USER'S POSTS AND COUNT
router.get("/:userId/postcount", async (req, res) => {
  try {
    const posts = await Post.find({ username: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("username", "username email");
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
