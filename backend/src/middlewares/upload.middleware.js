import multer from "multer";
import path from "path";
import fs from "fs";
import AppError from "../utils/AppError.js";
import { env } from "../config/env.js";

const resumesUploadDir = path.join(process.cwd(), "uploads", "resumes");

if (!fs.existsSync(resumesUploadDir)) {
  fs.mkdirSync(resumesUploadDir, { recursive: true });
}

const allowedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resumesUploadDir);
  },

  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const safeUserId = req.user?._id?.toString() || "anonymous";
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    cb(null, `resume-${safeUserId}-${uniqueSuffix}${fileExtension}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new AppError("Only PDF and DOCX resume files are allowed", 400),
      false
    );
  }

  cb(null, true);
};

export const uploadResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024,
  },
});