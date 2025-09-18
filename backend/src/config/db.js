import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
// Dummy DB config
export const connectDB = () => {
  const uri = process.env.MONGO_URI;
  mongoose.connect(uri, { 
  });
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", () => {
    console.log("Connected to MongoDB");
  });
};