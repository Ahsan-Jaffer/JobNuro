import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getRecommendedJobsController,
  getJobRecommendationDetailController,
} from "../controllers/recommendation.controller.js";

const router = express.Router();

router.use(protect);

router.get("/jobs", getRecommendedJobsController);
router.get("/jobs/:jobId", getJobRecommendationDetailController);

export default router;