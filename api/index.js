import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

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
