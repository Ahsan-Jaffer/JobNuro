import multer from "multer";
import { env } from "../config/env.js";
import { sendError } from "../utils/apiResponse.js";

export const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let responseErrors = err.errors || [];

  if (err instanceof multer.MulterError) {
    statusCode = 400;

    if (err.code === "LIMIT_FILE_SIZE") {
      message = `Resume file size cannot exceed ${env.maxFileSizeMb} MB`;
    } else {
      message = err.message;
    }
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource ID";
  }

  if (env.nodeEnv === "development") {
    console.error("Error:", {
      message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
    });
  }

  return sendError(res, {
    statusCode,
    message,
    errors: responseErrors,
  });
};