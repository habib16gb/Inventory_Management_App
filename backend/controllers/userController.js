import User from "../models/userModel.js";
import Token from "../models/tokenModel.js";
import sendEmail from "../utils/sendEmail.js";
import asyncHandler from "express-async-handler";
import { generateAT } from "../utils/generateAT.js";
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, photo, phone, bio } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("please fill all required fields");
  }

  const existUser = await User.findOne({ email });

  if (existUser) {
    res.status(StatusCodes.CONFLICT);
    throw new Error("Email already Exist");
  }

  const newUser = await User.create({
    name,
    email,
    password,
    photo,
    phone,
    bio,
  });

  const payload = {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
  };

  if (newUser) {
    generateAT(res, payload);
    res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      photo: newUser.photo,
    });
  } else {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("Error in Server");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const userExist = await User.findOne({ email });

  if (!email || !password) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("email and password fields are required");
  }

  if (userExist && (await userExist.matchPassword(password))) {
    const payload = {
      id: userExist._id,
      name: userExist.name,
      email: userExist.email,
    };
    generateAT(res, payload);
    res.status(StatusCodes.OK).json(payload);
  } else {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error("email or password incorrect");
  }
});

const logout = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "user logged out" });
});

const getUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  const user = await User.findOne({ _id });
  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`user with id: ${_id} not found`);
  }

  res.status(StatusCodes.OK).json(user);
});

const updateUser = asyncHandler(async (req, res) => {
  const { name, photo, phone, bio } = req.body;
  const { _id } = req.user;
  const user = await User.findOneAndUpdate(
    _id,
    {
      name,
      photo,
      phone,
      bio,
    },
    {
      new: true,
    }
  );

  res.status(200).json(user);
});

const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, password } = req.body;
  const { _id } = req.user;

  const user = await User.findById(_id);

  if (!oldPassword) {
    res.status(StatusCodes.BAD_REQUEST);
    throw new Error("old password is required to update password");
  }

  if (await user.matchPassword(oldPassword)) {
    const user = await User.findOneAndUpdate(_id, {
      password,
    });
    res.status(StatusCodes.OK);
    res.json({ message: "password updated success" });
  } else {
    res.status(StatusCodes.UNAUTHORIZED);
    throw new Error("password incorrect");
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(StatusCodes.NOT_FOUND);
    throw new Error(`user with email: ${email} not found`);
  }

  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
  }).save();

  const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

  const message = `
    <h2>Hello ${user.name}</h2>
    <p>Please use the url bellow to reset your password</p>
    <p>Link is valid for only 30 minutes</p>
    <a href='${resetUrl}'>${resetUrl}</a>
  `;

  const subject = "Password reset";
  const send_to = user.email;
  const send_from = process.env.EMAIL_USER;

  try {
    await sendEmail(subject, message, send_to, send_from);
    res.status(StatusCodes.OK).json({ message: "reset email send" });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export {
  registerUser,
  loginUser,
  logout,
  getUser,
  updateUser,
  updatePassword,
  resetPassword,
};
