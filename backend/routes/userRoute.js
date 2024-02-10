import express from "express";
import {
  loginUser,
  logout,
  registerUser,
  getUser,
  updateUser,
  updatePassword,
  resetPassword,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const userRoute = express.Router();

userRoute.route("/register").post(registerUser);
userRoute.route("/login").post(loginUser);
userRoute.route("/logout").post(logout);
userRoute.route("/profile").get(protect, getUser).patch(protect, updateUser);
userRoute.route("/updatepass").patch(protect, updatePassword);
userRoute.route('/resetpass').post(protect, resetPassword)

export default userRoute;
