import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

dotenv.config();

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  
  if (!uri) {
    logger.error('MONGO_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      // Connection pool settings for better performance
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    });
    
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }

  const db = mongoose.connection;
  
  db.on("error", (err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });
  
  db.on("disconnected", () => {
    logger.error("MongoDB disconnected. Attempting to reconnect...");
  });
  
  db.on("reconnected", () => {
    logger.info("MongoDB reconnected");
  });
};