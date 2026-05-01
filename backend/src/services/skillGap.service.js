import SkillGap from "../models/SkillGap.model.js";
import Resume from "../models/Resume.model.js";
import Job from "../models/Job.model.js";
import AppError from "../utils/AppError.js";
import { analyzeJobFit } from "./recommendation.service.js";
import { getOptionalSkillSuggestions } from "../utils/optionalSkillSuggestions.js";

const effortBySkill = {
  "HTML": "Short",
  "CSS": "Short",
  "JavaScript": "Medium",
  "TypeScript": "Medium",
  "React": "Medium",
  "Next.js": "Medium",
  "Tailwind CSS": "Short",
  "REST API": "Short",
  "Node.js": "Medium",
  "Express.js": "Short",
  "MongoDB": "Medium",
  "SQL": "Medium",
  "Python": "Medium",
  "FastAPI": "Short",
  "Flask": "Short",
  "Docker": "Medium",
  "Redis": "Medium",
  "GraphQL": "Medium",
  "Machine Learning": "Long",
  "NLP": "Long",
  "TensorFlow": "Long",
  "PyTorch": "Long",
  "Pandas": "Medium",
  "NumPy": "Medium",
  "Figma": "Short",
  "Postman": "Short",
  "Git": "Short",
};

const getEstimatedEffort = (skill) => {
  return effortBySkill[skill] || "Medium";
};

const getPriority = ({ category, impact }) => {
  if (category === "Critical" && impact >= 8) {
    return "Learn First";
  }

  if (category === "Critical") {
    return "High";
  }

  if (category === "Important" && impact >= 5) {
    return "Medium";
  }

  return "Low";
};

const buildReason = ({ skill, category, impact, projectedScore }) => {
  if (category === "Critical") {
    return `${skill} is a required skill for this job. Learning it can improve your job-fit score by ${impact} points to ${projectedScore}%.`;
  }

  if (category === "Important") {
    return `${skill} is a preferred skill for this job. Learning it can strengthen your profile and improve your score by ${impact} points.`;
  }

  return `${skill} is an optional role-related skill. It may not be required, but it can make your profile more competitive.`;
};

const buildSummary = ({
  currentFitScore,
  criticalGaps,
  importantGaps,
  topImpactSkill,
}) => {
  if (currentFitScore >= 80) {
    return "You are already a strong match for this role. Focus on polishing your resume and preparing for interviews.";
  }

  if (topImpactSkill) {
    return `Your current fit score is ${currentFitScore}%. Learning ${topImpactSkill.skill} first can improve your score the most.`;
  }

  if (criticalGaps.length > 0) {
    return `Your current fit score is ${currentFitScore}%. Focus on critical required skills first: ${criticalGaps.slice(0, 3).join(", ")}.`;
  }

  if (importantGaps.length > 0) {
    return `Your current fit score is ${currentFitScore}%. You meet the core requirements, but improving preferred skills can make your profile stronger.`;
  }

  return `Your current fit score is ${currentFitScore}%. Keep improving your resume with stronger projects and measurable achievements.`;
};

const addSkillToResumeForSimulation = (resume, skill) => {
  const resumeObject = resume.toObject ? resume.toObject() : { ...resume };

  const existingSkills = resumeObject.parsedProfile?.skills || [];

  return {
    ...resumeObject,
    parsedProfile: {
      ...resumeObject.parsedProfile,
      skills: [...new Set([...existingSkills, skill])],
    },
  };
};

const buildImpactSimulator = ({ resume, job, currentAnalysis, optionalGaps }) => {
  const currentScore = currentAnalysis.fitScore;

  const gapItems = [
    ...currentAnalysis.missingRequiredSkills.map((skill) => ({
      skill,
      category: "Critical",
    })),
    ...currentAnalysis.missingPreferredSkills.map((skill) => ({
      skill,
      category: "Important",
    })),
    ...optionalGaps.map((skill) => ({
      skill,
      category: "Optional",
    })),
  ];

  const impactItems = gapItems.map((gapItem) => {
    const simulatedResume = addSkillToResumeForSimulation(resume, gapItem.skill);
    const simulatedAnalysis = analyzeJobFit({
      resume: simulatedResume,
      job,
    });

    const projectedScore = simulatedAnalysis.fitScore;
    const impact = Math.max(projectedScore - currentScore, 0);

    return {
      skill: gapItem.skill,
      category: gapItem.category,
      currentScore,
      projectedScore,
      impact,
      priority: getPriority({
        category: gapItem.category,
        impact,
      }),
      estimatedEffort: getEstimatedEffort(gapItem.skill),
      reason: buildReason({
        skill: gapItem.skill,
        category: gapItem.category,
        impact,
        projectedScore,
      }),
    };
  });

  return impactItems.sort((a, b) => {
    const priorityOrder = {
      "Learn First": 1,
      High: 2,
      Medium: 3,
      Low: 4,
    };

    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    return b.impact - a.impact;
  });
};

const buildSkillGapResponse = ({ skillGap, job }) => {
  const safeSkillGap = skillGap.toSafeObject();

  return {
    ...safeSkillGap,
    job: {
      id: job._id,
      title: job.title,
      company: job.company,
      location: job.location,
      workMode: job.workMode,
      jobType: job.jobType,
      experienceLevel: job.experienceLevel,
    },
  };
};

export const generateSkillGapAnalysis = async ({ userId, jobId }) => {
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

  const currentAnalysis = analyzeJobFit({ resume, job });

  const userSkills = resume.parsedProfile?.skills || [];

  const criticalGaps = currentAnalysis.missingRequiredSkills || [];
  const importantGaps = currentAnalysis.missingPreferredSkills || [];
  const optionalGaps = getOptionalSkillSuggestions({
    job,
    userSkills,
    requiredSkills: job.requiredSkills,
    preferredSkills: job.preferredSkills,
    limit: 3,
  });

  const impactSimulator = buildImpactSimulator({
    resume,
    job,
    currentAnalysis,
    optionalGaps,
  });

  const recommendedLearningOrder = impactSimulator.map((item) => item.skill);

  const topImpactSkill = impactSimulator.find((item) => item.impact > 0);

  const summary = buildSummary({
    currentFitScore: currentAnalysis.fitScore,
    criticalGaps,
    importantGaps,
    topImpactSkill,
  });

  const skillGap = await SkillGap.findOneAndUpdate(
    {
      userId,
      resumeId: resume._id,
      jobId: job._id,
    },
    {
      userId,
      resumeId: resume._id,
      jobId: job._id,
      currentFitScore: currentAnalysis.fitScore,
      matchedSkills: currentAnalysis.matchedSkills,
      missingSkills: currentAnalysis.missingSkills,
      criticalGaps,
      importantGaps,
      optionalGaps,
      impactSimulator,
      recommendedLearningOrder,
      summary,
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  return buildSkillGapResponse({ skillGap, job });
};

export const getSkillGapAnalysis = async ({ userId, jobId }) => {
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

  const skillGap = await SkillGap.findOne({
    userId,
    resumeId: resume._id,
    jobId,
  });

  if (!skillGap) {
    return generateSkillGapAnalysis({ userId, jobId });
  }

  return buildSkillGapResponse({ skillGap, job });
};