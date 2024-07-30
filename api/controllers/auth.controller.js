import User from "../models/user.model.js";
import bcrypt from "bcrypt";

export const signup = async (req, res) => {
  const { username, email, password } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 12);
  const newUser = User({
    username,
    email,
    password: hashedPassword,
  });

  await newUser.save();

  res.status(201).json({
    message: "User created successfully",
  });
};
