import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { env } from "../config/env.js";
import AppError from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authentication token is missing", 401));
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return next(new AppError("Authentication token is missing", 401));
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    return next(new AppError("Invalid or expired authentication token", 401));
  }

  const user = await User.findById(decodedToken.userId);

  if (!user || !user.isActive) {
    return next(new AppError("User no longer exists or is inactive", 401));
  }

  req.user = user;

  next();
});

export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("You are not allowed to perform this action", 403));
    }

    next();
  };
};