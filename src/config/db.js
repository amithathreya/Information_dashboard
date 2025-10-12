import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    const msg =
      "MONGO_URI environment variable is not defined. Please set MONGO_URI in your environment or in a .env file.";
    console.error(msg);
    throw new Error(msg);
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
};