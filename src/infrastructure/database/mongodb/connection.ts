import mongoose from "mongoose";
import config from "@shared/utils/config";

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.database.url);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
  console.log("MongoDB disconnected");
}
