const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

//REGISTER
router.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPass,
    });

    let findUser = await User.findOne({ email: req.body.email });

    if (findUser) return res.status(400).json("User already exist");

    const user = await newUser.save();
    res.status(200).json({
      message: "Register Successfully",
      user,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// LOGIN

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(400).json("Invalid Email or Password");

    const validated = await bcrypt.compare(req.body.password, user.password);

    if (!validated) return res.status(400).json("wrong credentials !");

    const { password, ...others } = user._doc;

    res.status(200).json(others);
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
