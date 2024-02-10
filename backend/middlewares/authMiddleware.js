import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import User from "../models/userModel.js";

const protect = asyncHandler(async (req, res, next) => {
  const accessToken = req.cookies.jwt;

  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(StatusCodes.UNAUTHORIZED);
      throw new Error("access token invalid or expired");
    }
  } else {
    res.status(StatusCodes.FORBIDDEN);
    throw new Error("no access token");
  }
});

export { protect };
