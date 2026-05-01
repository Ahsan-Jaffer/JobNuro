import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  analyzeSkillGapController,
  getSkillGapController,
} from "../controllers/skillGap.controller.js";

const router = express.Router();

router.use(protect);

router.post("/analyze/:jobId", analyzeSkillGapController);
router.get("/:jobId", getSkillGapController);

export default router;