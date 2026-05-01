import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    originalFileName: {
      type: String,
      required: true,
      trim: true,
    },

    fileType: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    rawText: {
      type: String,
      default: "",
    },

    parsedProfile: {
      name: {
        type: String,
        default: null,
      },
      email: {
        type: String,
        default: null,
      },
      phone: {
        type: String,
        default: null,
      },
      links: {
        linkedin: {
          type: String,
          default: null,
        },
        github: {
          type: String,
          default: null,
        },
        portfolio: {
          type: String,
          default: null,
        },
        others: {
          type: [String],
          default: [],
        },
      },
      skills: {
        type: [String],
        default: [],
      },
      categorizedSkills: {
        type: Map,
        of: [String],
        default: {},
      },
      education: {
        type: [String],
        default: [],
      },
      projects: {
        type: [String],
        default: [],
      },
      experience: {
        type: [String],
        default: [],
      },
      certifications: {
        type: [String],
        default: [],
      },
      sectionsFound: {
        type: [String],
        default: [],
      },
    },

    atsScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    atsBreakdown: {
      formatting: {
        type: Number,
        default: 0,
      },
      sections: {
        type: Number,
        default: 0,
      },
      keywords: {
        type: Number,
        default: 0,
      },
      skills: {
        type: Number,
        default: 0,
      },
      achievements: {
        type: Number,
        default: 0,
      },
      contact: {
        type: Number,
        default: 0,
      },
      grammar: {
        type: Number,
        default: 0,
      },
    },

    suggestions: {
      type: [String],
      default: [],
    },

    analysisMeta: {
      fileType: {
        type: String,
        default: null,
      },
      wordCount: {
        type: Number,
        default: 0,
      },
      skillsFound: {
        type: Number,
        default: 0,
      },
      sectionsFound: {
        type: [String],
        default: [],
      },
    },

    status: {
      type: String,
      enum: ["uploaded", "analyzing", "analyzed", "failed"],
      default: "uploaded",
    },

    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

resumeSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    userId: this.userId,
    fileName: this.fileName,
    originalFileName: this.originalFileName,
    fileType: this.fileType,
    fileSize: this.fileSize,
    rawText: this.rawText,
    parsedProfile: this.parsedProfile,
    atsScore: this.atsScore,
    atsBreakdown: this.atsBreakdown,
    suggestions: this.suggestions,
    analysisMeta: this.analysisMeta,
    status: this.status,
    errorMessage: this.errorMessage,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;