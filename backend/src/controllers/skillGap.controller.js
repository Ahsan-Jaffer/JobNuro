import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  generateSkillGapAnalysis,
  getSkillGapAnalysis,
} from "../services/skillGap.service.js";

export const analyzeSkillGapController = asyncHandler(async (req, res) => {
  const skillGap = await generateSkillGapAnalysis({
    userId: req.user._id,
    jobId: req.params.jobId,
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: "Skill gap analysis generated successfully",
    data: {
      skillGap,
    },
  });
});

export const getSkillGapController = asyncHandler(async (req, res) => {
  const skillGap = await getSkillGapAnalysis({
    userId: req.user._id,
    jobId: req.params.jobId,
  });

  return sendSuccess(res, {
    message: "Skill gap analysis fetched successfully",
    data: {
      skillGap,
    },
  });
});