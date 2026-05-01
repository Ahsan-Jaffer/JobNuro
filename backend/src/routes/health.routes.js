import express from "express";
import { sendSuccess } from "../utils/apiResponse.js";

const router = express.Router();

router.get("/", (req, res) => {
  return sendSuccess(res, {
    message: "JobNuro backend is running",
    data: {
      service: "JobNuro API",
      status: "healthy",
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;