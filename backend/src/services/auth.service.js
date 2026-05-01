import User from "../models/User.model.js";
import AppError from "../utils/AppError.js";
import { generateToken } from "../utils/generateToken.js";

const buildAuthResponse = (user) => {
  const token = generateToken(user._id);

  return {
    user: user.toSafeObject(),
    token,
  };
};

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("An account with this email already exists", 409);
  }

  const user = await User.create({
    name,
    email,
    password,
    authProvider: "local",
  });

  return buildAuthResponse(user);
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email, authProvider: "local" }).select(
    "+password"
  );

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("Your account is inactive. Please contact support.", 403);
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new AppError("Invalid email or password", 401);
  }

  user.lastLoginAt = new Date();
  await user.save();

  return buildAuthResponse(user);
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    throw new AppError("User not found", 404);
  }

  return user.toSafeObject();
};