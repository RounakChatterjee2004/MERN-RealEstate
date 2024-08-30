import express from "express";
import {
  deleteUser,
  getUserListing,
  test,
  updateUser,
  getUser,
} from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/test", test);
router.post("/update/:id", updateUser);
router.delete("/delete/:id", deleteUser);
router.get("/listings/:id", getUserListing);
router.get("/:id", getUser);
export default router;
