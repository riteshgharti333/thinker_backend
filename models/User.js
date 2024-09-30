const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: false,
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
  },
  { timestamps: true },
);

// Hash the new password before saving
UserSchema.pre("save", async function async(next) {
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
