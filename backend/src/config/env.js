import dotenv from "dotenv";

dotenv.config();

const requiredEnvVariables = ["PORT", "MONGO_URI", "JWT_SECRET"];

requiredEnvVariables.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",

  mongoUri: process.env.MONGO_URI,

  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://localhost:8000",

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 5),
};