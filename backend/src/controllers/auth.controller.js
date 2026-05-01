import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../services/auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const authData = await registerUser(req.body);

  return sendSuccess(res, {
    statusCode: 201,
    message: "Account created successfully",
    data: authData,
  });
});

export const login = asyncHandler(async (req, res) => {
  const authData = await loginUser(req.body);

  return sendSuccess(res, {
    message: "Login successful",
    data: authData,
  });
});

export const logout = asyncHandler(async (req, res) => {
  return sendSuccess(res, {
    message: "Logout successful",
    data: null,
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user._id);

  return sendSuccess(res, {
    message: "Current user fetched successfully",
    data: {
      user,
    },
  });
});