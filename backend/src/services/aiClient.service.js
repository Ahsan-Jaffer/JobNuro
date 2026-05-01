import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import { env } from "../config/env.js";
import AppError from "../utils/AppError.js";

export const analyzeResumeWithAI = async (filePath, originalFileName) => {
  try {
    const formData = new FormData();

    formData.append("resume", fs.createReadStream(filePath), {
      filename: originalFileName,
      contentType: getContentTypeFromExtension(originalFileName),
    });

    const response = await axios.post(
      `${env.aiServiceUrl}/api/resume/analyze`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 60000,
      }
    );

    if (!response.data?.success || !response.data?.data) {
      throw new AppError("Resume analysis service returned an invalid response", 502);
    }

    return response.data.data;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error.response?.data?.detail) {
      throw new AppError(error.response.data.detail, error.response.status || 502);
    }

    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      throw new AppError("Resume analysis service is currently unavailable", 503);
    }

    throw new AppError("Failed to analyze resume using AI service", 502);
  }
};

const getContentTypeFromExtension = (fileName) => {
  const extension = path.extname(fileName).toLowerCase();

  if (extension === ".pdf") {
    return "application/pdf";
  }

  if (extension === ".docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  return "application/octet-stream";
};