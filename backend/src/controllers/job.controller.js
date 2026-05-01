import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { seedJobs, getJobs, getJobById } from "../services/job.service.js";

export const seedJobsController = asyncHandler(async (req, res) => {
  const result = await seedJobs();

  return sendSuccess(res, {
    message: "Jobs seeded successfully",
    data: result,
  });
});

export const getJobsController = asyncHandler(async (req, res) => {
  const result = await getJobs(req.query);

  return sendSuccess(res, {
    message: "Jobs fetched successfully",
    data: {
      jobs: result.jobs,
    },
    meta: {
      pagination: result.pagination,
    },
  });
});

export const getJobByIdController = asyncHandler(async (req, res) => {
  const job = await getJobById(req.params.jobId);

  return sendSuccess(res, {
    message: "Job fetched successfully",
    data: {
      job,
    },
  });
});