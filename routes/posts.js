const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

//CREATE POST
router.post("/", async (req, res) => {

 // Destructure userId and username from req.body
 const { userId, username, ...postDetails } = req.body;

 // Create a new post with the userId and username
 const newPost = new Post({
   ...postDetails,
   userId,
   username
 });

  try {
    const savedPost = await newPost.save();

    await User.findByIdAndUpdate(req.body.userId , {
      $push: {postId : savedPost._id}
    });

    res.status(200).json({
      message: "Post Created",
      savedPost,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE POST

router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.username === req.body.username) {
      try {
        const updatedPost = await Post.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true }
        );
        res.status(200).json({
          message: "Post Updated",
          updatedPost,
        });
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(401).json("You can update only Your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE POST
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json("Post not found");
    }

    if (post.userId.toString() === req.body.userId) {
      try {
        await post.deleteOne();
        res.status(200).json("Post has been deleted...");
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(401).json("You can delete only your post!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET FEATURE POST
router.get("/random", async (req, res) => {
  try {
    const randomPosts = await Post.aggregate([{ $sample: { size: 5 } }]);

    res.status(200).json(randomPosts);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

//GET POST
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL POST
router.get("/", async (req, res) => {
  const username = req.query.user;
  const catName = req.query.cat;
  try {
    let posts;
    if (username) {
      posts = await Post.find({ username: username }).sort({ createdAt: -1 });
    } else if (catName) {
      posts = await Post.find({
        categories: {
          $in: [catName],
        },
      }).sort({ createdAt: -1 });
    } else {
      posts = await Post.find().sort({ createdAt: -1 });
    }
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});



module.exports = router;
