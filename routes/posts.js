const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const moment = require("moment");

// GET TRENDING POSTS
router.get("/trending", async (req, res) => {
  try {
    const fiveDaysAgo = moment().subtract(5, "days").toDate();
    const thirtyDaysAgo = moment().subtract(900, "days").toDate();

    // Step 1: Fetch all posts from the last 5 days, sorted by views
    let recentTrendingPosts = await Post.find({
      createdAt: { $gte: fiveDaysAgo },
    }).sort({ views: -1 });

    // Step 2: Fetch older posts (up to 30 days ago) that are still trending by views, excluding already fetched posts
    let olderTrendingPosts = await Post.find({
      createdAt: { $gte: thirtyDaysAgo, $lt: fiveDaysAgo }, // Between 30 days and 5 days ago
    }).sort({ views: -1 });

    // Step 3: Combine both sets of posts (recent and older)
    const allTrendingPosts = recentTrendingPosts.concat(olderTrendingPosts);

    // Step 4: Return the combined list of trending posts
    res.status(200).json({ trendingPosts: allTrendingPosts });
  } catch (err) {
    console.error("Error fetching trending posts:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});


// LESTEST POSTS
router.get("/latest", async (req, res) => {
  try {
    const latestPosts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json({ latestPosts: latestPosts });
  } catch (err) {
    console.error("Error fetching latest posts:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

// GET POPULAR POSTS
router.get("/popular", async (req, res) => {
  try {
    const popularPosts = await Post.find().sort({ views: -1 }); // Change limit as needed
    res.status(200).json({ popularPosts: popularPosts });
  } catch (err) {
    console.error("Error fetching popular posts:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

// CREATE POST
router.post("/", async (req, res) => {
  const { userId, username, ...postDetails } = req.body;

  // Ensure userId and username are provided
  if (!userId || !username) {
    return res.status(400).json({ error: "userId and username are required" });
  }

  const newPost = new Post({
    ...postDetails,
    userId,
    username,
  });

  try {
    const savedPost = await newPost.save();
    await User.findByIdAndUpdate(userId, {
      $push: { postId: savedPost._id },
    });
    res.status(200).json({
      message: "Post Created",
      savedPost,
    });
  } catch (err) {
    console.error("Error creating post:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

// UPDATE POST
router.put("/single/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.username !== req.body.username) {
      return res.status(401).json({ message: "You can update only your post" });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
    );

    res.status(200).json({
      message: "Post Updated",
      updatedPost,
    });
  } catch (err) {
    console.error("Error updating post:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

// DELETE POST
router.delete("/single/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== req.body.userId) {
      return res.status(401).json({ message: "You can delete only your post" });
    }

    await post.deleteOne();

    res.status(200).json({ message: "Post has been deleted" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

// GET FEATURE POST
router.get("/random", async (req, res) => {
  try {
    const randomPosts = await Post.aggregate([{ $sample: { size: 5 } }]);
    res.status(200).json(randomPosts);
  } catch (err) {
    console.error("Error fetching random posts:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

// FETCH POST AND INCREMENT VIEWS
router.get("/single/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.views = (post.views || 0) + 1;
    const updatedPost = await post.save();

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("Error fetching post:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

// GET ALL POSTS
router.get("/", async (req, res) => {
  const username = req.query.user;
  const catName = req.query.cat;

  try {
    let posts;
    if (username) {
      posts = await Post.find({ username: username }).sort({ createdAt: -1 });
    } else if (catName) {
      posts = await Post.find({
        categories: { $in: [catName] },
      }).sort({ createdAt: -1 });
    } else {
      posts = await Post.find().sort({ createdAt: -1 });
    }
    res.status(200).json(posts);
  } catch (err) {
    console.error("Error fetching all posts:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

module.exports = router;
