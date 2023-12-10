const express = require("express");
const dotenv = require("dotenv")
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");
const categoryRoute = require("./routes/categories");
const multer = require("multer");
const path = require("path");
const cors = require('cors');


dotenv.config();

const app = express();
app.use(express.json());
// const PORT = process.env.PORT || 3000

const corsOptions = {
  origin: 'http://localhost:5173', // Replace with your frontend's URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

app.use(cors(corsOptions));

app.use("/images", express.static(path.join(__dirname, "/images")));

const PORT = process.env.PORT || 8000

mongoose
.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("DB Connection Successfull!"))
  .catch((err) => {
    console.log(err);
  });

  
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  res.status(200).json("File has been Uploaded");
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/categories", categoryRoute);


app.get("/" , (req,res) => {
  res.send("Welcome to BLOG ONCE");
})

app.listen(PORT, () => {
  console.log(`Backend is runnning ${process.env.PORT}`);
});
