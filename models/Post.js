const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    desc: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true
    },
    categories: {
      type: Array,
      required: false,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
