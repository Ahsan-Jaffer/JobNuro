import Job from "../models/Job.model.js";
import AppError from "../utils/AppError.js";
import { jobsDataset } from "../data/jobs.dataset.js";

export const seedJobs = async () => {
  await Job.deleteMany({ source: "JobNuro Demo Dataset" });

  const jobs = await Job.insertMany(jobsDataset);

  return {
    insertedCount: jobs.length,
  };
};

export const getJobs = async (query = {}) => {
  const {
    search,
    location,
    workMode,
    jobType,
    experienceLevel,
    page = 1,
    limit = 20,
  } = query;

  const filter = {
    isActive: true,
  };

  if (search) {
    filter.$text = {
      $search: search,
    };
  }

  if (location) {
    filter.location = new RegExp(location, "i");
  }

  if (workMode) {
    filter.workMode = workMode;
  }

  if (jobType) {
    filter.jobType = jobType;
  }

  if (experienceLevel) {
    filter.experienceLevel = experienceLevel;
  }

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = (pageNumber - 1) * limitNumber;

  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNumber),
    Job.countDocuments(filter),
  ]);

  return {
    jobs: jobs.map((job) => job.toSafeObject()),
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      pages: Math.ceil(total / limitNumber),
    },
  };
};

export const getJobById = async (jobId) => {
  const job = await Job.findOne({
    _id: jobId,
    isActive: true,
  });

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  return job.toSafeObject();
};