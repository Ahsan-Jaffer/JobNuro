import mongoose from "mongoose";

const impactSimulatorSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["Critical", "Important", "Optional"],
      required: true,
    },

    currentScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    projectedScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    impact: {
      type: Number,
      required: true,
      min: 0,
    },

    priority: {
      type: String,
      enum: ["Learn First", "High", "Medium", "Low"],
      required: true,
    },

    estimatedEffort: {
      type: String,
      enum: ["Short", "Medium", "Long"],
      default: "Short",
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const skillGapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
      index: true,
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    currentFitScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    matchedSkills: {
      type: [String],
      default: [],
    },

    missingSkills: {
      type: [String],
      default: [],
    },

    criticalGaps: {
      type: [String],
      default: [],
    },

    importantGaps: {
      type: [String],
      default: [],
    },

    optionalGaps: {
      type: [String],
      default: [],
    },

    impactSimulator: {
      type: [impactSimulatorSchema],
      default: [],
    },

    recommendedLearningOrder: {
      type: [String],
      default: [],
    },

    summary: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

skillGapSchema.index({ userId: 1, jobId: 1, resumeId: 1 }, { unique: true });

skillGapSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    userId: this.userId,
    resumeId: this.resumeId,
    jobId: this.jobId,
    currentFitScore: this.currentFitScore,
    matchedSkills: this.matchedSkills,
    missingSkills: this.missingSkills,
    criticalGaps: this.criticalGaps,
    importantGaps: this.importantGaps,
    optionalGaps: this.optionalGaps,
    impactSimulator: this.impactSimulator,
    recommendedLearningOrder: this.recommendedLearningOrder,
    summary: this.summary,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const SkillGap = mongoose.model("SkillGap", skillGapSchema);

export default SkillGap;