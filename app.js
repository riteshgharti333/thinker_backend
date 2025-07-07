const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");
const categoryRoute = require("./routes/categories");
const passwordRoute = require("./routes/password");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.options("*", cors());

app.use("/images", express.static(path.join(__dirname, "/images")));

mongoose
  .connect(process.env.MONGO_URL, {})
  .then(() => console.log("DB Connection Successful!"))
  .catch((err) => {
    console.log("MongoDB connection error:", err);
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

app.use("/api/posts", postRoute);
app.use("/api/auth", authRoute);
app.use("/api/profile", userRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/password", passwordRoute);
app.use("/api/user", userRoute);

app.get("/", (req, res) => {
  res.send("Welcome to Thinker.");
});

app.listen(PORT, () => {
  console.log(`Backend is running on port ${PORT}`);
});
