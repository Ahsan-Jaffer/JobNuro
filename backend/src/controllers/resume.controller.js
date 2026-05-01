import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadAndAnalyzeResume,
  getLatestResumeByUser,
  getResumeById,
  deleteResumeById,
} from "../services/resume.service.js";

export const uploadResumeController = asyncHandler(async (req, res) => {
  const resume = await uploadAndAnalyzeResume({
    userId: req.user._id,
    file: req.file,
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: "Resume analyzed successfully",
    data: {
      resume,
    },
  });
});

export const getLatestResumeController = asyncHandler(async (req, res) => {
  const resume = await getLatestResumeByUser(req.user._id);

  return sendSuccess(res, {
    message: "Latest resume analysis fetched successfully",
    data: {
      resume,
    },
  });
});

export const getResumeByIdController = asyncHandler(async (req, res) => {
  const resume = await getResumeById({
    userId: req.user._id,
    resumeId: req.params.resumeId,
  });

  return sendSuccess(res, {
    message: "Resume analysis fetched successfully",
    data: {
      resume,
    },
  });
});

export const deleteResumeController = asyncHandler(async (req, res) => {
  const deletedResume = await deleteResumeById({
    userId: req.user._id,
    resumeId: req.params.resumeId,
  });

  return sendSuccess(res, {
    message: "Resume analysis deleted successfully",
    data: {
      resume: deletedResume,
    },
  });
});