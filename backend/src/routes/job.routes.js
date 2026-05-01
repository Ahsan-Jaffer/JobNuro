import express from "express";
import {
  seedJobsController,
  getJobsController,
  getJobByIdController,
} from "../controllers/job.controller.js";

const router = express.Router();

router.post("/seed", seedJobsController);
router.get("/", getJobsController);
router.get("/:jobId", getJobByIdController);

export default router;