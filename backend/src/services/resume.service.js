import Resume from "../models/Resume.model.js";
import AppError from "../utils/AppError.js";
import { analyzeResumeWithAI } from "./aiClient.service.js";
import { deleteFile } from "../utils/deleteFile.js";

export const uploadAndAnalyzeResume = async ({ userId, file }) => {
  if (!file) {
    throw new AppError("Resume file is required", 400);
  }

  let resumeDocument = null;

  try {
    resumeDocument = await Resume.create({
      userId,
      fileName: file.filename,
      originalFileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      filePath: file.path,
      status: "analyzing",
    });

    const analysisResult = await analyzeResumeWithAI(file.path, file.originalname);

    resumeDocument.rawText = analysisResult.rawText || "";
    resumeDocument.parsedProfile = analysisResult.parsedProfile || {};
    resumeDocument.atsScore = analysisResult.atsScore || 0;
    resumeDocument.atsBreakdown = analysisResult.atsBreakdown || {};
    resumeDocument.suggestions = analysisResult.suggestions || [];
    resumeDocument.analysisMeta = analysisResult.analysisMeta || {};
    resumeDocument.status = "analyzed";
    resumeDocument.errorMessage = null;

    await resumeDocument.save();

    return resumeDocument.toSafeObject();
  } catch (error) {
    if (resumeDocument) {
      resumeDocument.status = "failed";
      resumeDocument.errorMessage = error.message;
      await resumeDocument.save();
    }

    throw error;
  }
};

export const getLatestResumeByUser = async (userId) => {
  const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });

  if (!resume) {
    throw new AppError("No resume analysis found for this user", 404);
  }

  return resume.toSafeObject();
};

export const getResumeById = async ({ userId, resumeId }) => {
  const resume = await Resume.findOne({
    _id: resumeId,
    userId,
  });

  if (!resume) {
    throw new AppError("Resume analysis not found", 404);
  }

  return resume.toSafeObject();
};

export const deleteResumeById = async ({ userId, resumeId }) => {
  const resume = await Resume.findOne({
    _id: resumeId,
    userId,
  });

  if (!resume) {
    throw new AppError("Resume analysis not found", 404);
  }

  await deleteFile(resume.filePath);
  await resume.deleteOne();

  return {
    id: resume._id,
  };
};