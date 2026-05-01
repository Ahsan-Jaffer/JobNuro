import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getRecommendedJobs,
  getJobRecommendationDetail,
} from "../services/recommendation.service.js";

export const getRecommendedJobsController = asyncHandler(async (req, res) => {
  const result = await getRecommendedJobs(req.user._id);

  return sendSuccess(res, {
    message: "Recommended jobs fetched successfully",
    data: result,
  });
});

export const getJobRecommendationDetailController = asyncHandler(
  async (req, res) => {
    const result = await getJobRecommendationDetail({
      userId: req.user._id,
      jobId: req.params.jobId,
    });

    return sendSuccess(res, {
      message: "Job recommendation detail fetched successfully",
      data: result,
    });
  }
);