import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import listingRouter from "./routes/listing.route.js";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
dotenv.config();
const app = express();

app.listen(3000, () => {
  console.log("server is running on port 3000 !");
});
mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("connected to databse");
  })
  .catch((err) => {
    console.log(err);
  });

const __dirname = path.resolve();

const allowedOrigins = [
  "http://localhost:5173:", // Development URL
  "https://mern-realestate-t3qy.onrender.com/", // Replace with your actual frontend production URL
];
// Configure CORS
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);

app.use(express.static(path.join(__dirname, "/client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});
// middleware to handle errors
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
});
