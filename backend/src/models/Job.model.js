import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    workMode: {
      type: String,
      enum: ["Remote", "On-site", "Hybrid"],
      default: "On-site",
      index: true,
    },

    jobType: {
      type: String,
      enum: ["Internship", "Full-time", "Part-time", "Contract"],
      default: "Full-time",
      index: true,
    },

    experienceLevel: {
      type: String,
      enum: ["Internship", "Fresh", "Entry Level", "Junior", "Mid Level"],
      default: "Fresh",
      index: true,
    },

    requiredSkills: {
      type: [String],
      required: true,
      default: [],
    },

    preferredSkills: {
      type: [String],
      default: [],
    },

    description: {
      type: String,
      required: true,
    },

    responsibilities: {
      type: [String],
      default: [],
    },

    requirements: {
      type: [String],
      default: [],
    },

    applyLink: {
      type: String,
      default: null,
    },

    source: {
      type: String,
      default: "JobNuro Demo Dataset",
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({
  title: "text",
  company: "text",
  description: "text",
  requiredSkills: "text",
  preferredSkills: "text",
});

jobSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    title: this.title,
    company: this.company,
    location: this.location,
    workMode: this.workMode,
    jobType: this.jobType,
    experienceLevel: this.experienceLevel,
    requiredSkills: this.requiredSkills,
    preferredSkills: this.preferredSkills,
    description: this.description,
    responsibilities: this.responsibilities,
    requirements: this.requirements,
    applyLink: this.applyLink,
    source: this.source,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Job = mongoose.model("Job", jobSchema);

export default Job;