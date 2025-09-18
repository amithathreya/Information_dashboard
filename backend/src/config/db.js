import mongoose from "mongoose";
// Dummy DB config
export const connectDB = () => {
  mongoose.connect("mongodb+srv://athreyaamith88_db_user:Jkh6hk4epOaiQd4z@miniproject.h43benh.mongodb.net/?retryWrites=true&w=majority&appName=MiniProject/testDB", {
  });
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", () => {
    console.log("Connected to MongoDB");
  });
};