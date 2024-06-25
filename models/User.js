const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilepic: {
      type: String,
      default: "",
    },
    // New fields for password change
    currentPassword: {
      type: String,
      select: false, // Exclude from default queries
    },
    newPassword: {
      type: String,
      select: false, // Exclude from default queries
    },
    // New field for storing blog IDs
    blogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  { timestamps: true }
);

// Hash the new password before saving
UserSchema.pre("save", async function (next) {
  if (this.isModified("newPassword")) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.newPassword, salt);
      this.password = hashedPassword;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
