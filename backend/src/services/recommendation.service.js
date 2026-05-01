import Job from "../models/Job.model.js";
import Resume from "../models/Resume.model.js";
import AppError from "../utils/AppError.js";
import { matchSkillLists, calculateSkillScore } from "../utils/matchSkills.js";
import { calculateTfidfSimilarity } from "../utils/tfidfSimilarity.js";

const FRESH_FRIENDLY_LEVELS = ["Internship", "Fresh", "Entry Level"];

const buildJobText = (job) => {
  return [
    job.title,
    job.company,
    job.description,
    ...(job.requiredSkills || []),
    ...(job.preferredSkills || []),
    ...(job.responsibilities || []),
    ...(job.requirements || []),
  ].join(" ");
};

const calculateExperienceScore = (experienceLevel) => {
  if (FRESH_FRIENDLY_LEVELS.includes(experienceLevel)) {
    return 10;
  }

  if (experienceLevel === "Junior") {
    return 8;
  }

  if (experienceLevel === "Mid Level") {
    return 4;
  }

  return 6;
};

const calculateEducationScore = (resumeText = "") => {
  const normalizedText = resumeText.toLowerCase();

  const educationKeywords = [
    "computer science",
    "software engineering",
    "information technology",
    "bs cs",
    "bscs",
    "bsse",
    "bsit",
    "bachelor",
  ];

  const hasRelevantEducation = educationKeywords.some((keyword) =>
    normalizedText.includes(keyword)
  );

  return hasRelevantEducation ? 5 : 2;
};

const calculateLocationScore = () => {
  return 5;
};

const calculateJobSpecificAtsScore = ({
  matchedRequiredCount,
  requiredTotal,
  matchedPreferredCount,
  preferredTotal,
}) => {
  const totalMatched = matchedRequiredCount + matchedPreferredCount;
  const totalSkills = requiredTotal + preferredTotal;

  if (!totalSkills) {
    return 10;
  }

  return Math.round((totalMatched / totalSkills) * 10);
};

const buildExplanation = ({
  title,
  requiredMatch,
  preferredMatch,
  missingRequiredSkills,
  missingPreferredSkills,
  fitScore,
}) => {
  if (fitScore >= 80) {
    return `Strong match for ${title}. You match most core requirements and have a good profile for this role.`;
  }

  if (fitScore >= 60) {
    const missing = [...missingRequiredSkills, ...missingPreferredSkills]
      .slice(0, 3)
      .join(", ");

    return `Good potential match for ${title}. You match several important skills, but improving ${missing || "a few missing skills"} can increase your score.`;
  }

  if (requiredMatch.matchCount > 0 || preferredMatch.matchCount > 0) {
    return `Partial match for ${title}. You have some relevant skills, but several required skills are missing.`;
  }

  return `Low match for ${title}. This role requires skills that are not strongly visible in your current resume.`;
};

export const analyzeJobFit = ({ resume, job }) => {
  const userSkills = resume.parsedProfile?.skills || [];

  const requiredMatch = matchSkillLists(userSkills, job.requiredSkills || []);
  const preferredMatch = matchSkillLists(userSkills, job.preferredSkills || []);

  const requiredSkillMatchScore = calculateSkillScore(
    requiredMatch.matchCount,
    requiredMatch.totalCount,
    40
  );

  const preferredSkillMatchScore = calculateSkillScore(
    preferredMatch.matchCount,
    preferredMatch.totalCount,
    15
  );

  const roleSimilarityRatio = calculateTfidfSimilarity(
    resume.rawText || "",
    buildJobText(job)
  );

  const roleSimilarityScore = Math.round(roleSimilarityRatio * 15);
  const experienceLevelScore = calculateExperienceScore(job.experienceLevel);
  const educationFitScore = calculateEducationScore(resume.rawText);
  const locationFitScore = calculateLocationScore();

  const jobSpecificAtsScore = calculateJobSpecificAtsScore({
    matchedRequiredCount: requiredMatch.matchCount,
    requiredTotal: requiredMatch.totalCount,
    matchedPreferredCount: preferredMatch.matchCount,
    preferredTotal: preferredMatch.totalCount,
  });

  const scoreBreakdown = {
    requiredSkillMatch: requiredSkillMatchScore,
    preferredSkillMatch: preferredSkillMatchScore,
    roleSimilarity: roleSimilarityScore,
    experienceLevel: experienceLevelScore,
    educationFit: educationFitScore,
    locationFit: locationFitScore,
    jobSpecificAts: jobSpecificAtsScore,
  };

  const fitScore = Object.values(scoreBreakdown).reduce(
    (total, score) => total + score,
    0
  );

  const matchedSkills = [
    ...new Set([...requiredMatch.matched, ...preferredMatch.matched]),
  ];

  const missingSkills = [
    ...new Set([...requiredMatch.missing, ...preferredMatch.missing]),
  ];

  return {
    job: job.toSafeObject ? job.toSafeObject() : job,
    fitScore: Math.min(fitScore, 100),
    matchedSkills,
    missingSkills,
    matchedRequiredSkills: requiredMatch.matched,
    matchedPreferredSkills: preferredMatch.matched,
    missingRequiredSkills: requiredMatch.missing,
    missingPreferredSkills: preferredMatch.missing,
    tfidfSimilarity: Number((roleSimilarityRatio * 100).toFixed(2)),
    scoreBreakdown,
    explanation: buildExplanation({
      title: job.title,
      requiredMatch,
      preferredMatch,
      missingRequiredSkills: requiredMatch.missing,
      missingPreferredSkills: preferredMatch.missing,
      fitScore,
    }),
  };
};

export const getRecommendedJobs = async (userId) => {
  const resume = await Resume.findOne({
    userId,
    status: "analyzed",
  }).sort({ createdAt: -1 });

  if (!resume) {
    throw new AppError("Please upload and analyze your resume first", 404);
  }

  const jobs = await Job.find({
    isActive: true,
  }).sort({ createdAt: -1 });

  const recommendations = jobs
    .map((job) => analyzeJobFit({ resume, job }))
    .sort((a, b) => b.fitScore - a.fitScore);

  return {
    resume: {
      id: resume._id,
      atsScore: resume.atsScore,
      skills: resume.parsedProfile?.skills || [],
      uploadedAt: resume.createdAt,
    },
    recommendations,
  };
};

export const getJobRecommendationDetail = async ({ userId, jobId }) => {
  const resume = await Resume.findOne({
    userId,
    status: "analyzed",
  }).sort({ createdAt: -1 });

  if (!resume) {
    throw new AppError("Please upload and analyze your resume first", 404);
  }

  const job = await Job.findOne({
    _id: jobId,
    isActive: true,
  });

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  return {
    resume: {
      id: resume._id,
      atsScore: resume.atsScore,
      skills: resume.parsedProfile?.skills || [],
      uploadedAt: resume.createdAt,
    },
    recommendation: analyzeJobFit({ resume, job }),
  };
};