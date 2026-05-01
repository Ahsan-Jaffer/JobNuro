import { env } from "../config/env.js";
import { sendError } from "../utils/apiResponse.js";

export const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  const responseErrors = err.errors || [];

  if (env.nodeEnv === "development") {
    console.error("Error:", {
      message: err.message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
    });
  }

  return sendError(res, {
    statusCode,
    message: err.message || "Internal server error",
    errors: responseErrors,
  });
};