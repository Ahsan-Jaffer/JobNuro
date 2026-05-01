import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { uploadResume } from "../middlewares/upload.middleware.js";
import {
  uploadResumeController,
  getLatestResumeController,
  getResumeByIdController,
  deleteResumeController,
} from "../controllers/resume.controller.js";

const router = express.Router();

router.use(protect);

router.post("/upload", uploadResume.single("resume"), uploadResumeController);
router.get("/latest", getLatestResumeController);
router.get("/:resumeId", getResumeByIdController);
router.delete("/:resumeId", deleteResumeController);

export default router;