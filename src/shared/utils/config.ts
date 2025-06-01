import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const config = {
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || "development",
  },
  database: {
    url: process.env.MONGODB_URI || "mongodb://localhost:27017/api-solid",
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || "your_jwt_secret_key",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },
};

export default config;
