import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import Info from '../models/info.model.js';
import Grades from '../models/grades.model.js';
import Academic from '../models/academic.model.js';
import Attendance from '../models/attendance.model.js';

export const getAllUsers = async () => {
  return await User.find({}, 'USN');
};

export const loginUser = async (USN, password) => {
  const user = await User.findOne({ USN });
  if (!user) return { success: false };
  const match = await bcrypt.compare(password, user.password);
  return { success: match };
};

export const registerUser = async (USN, password) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const newUser = new User({ USN, password: hashedPassword });
  await newUser.save();
  return { success: true };
};

export const getUserInfo = async (USN) => {
  return await Info.findOne({ USN });
};

export const getUserGrades = async (USN) => {
  return await Grades.find({ USN });
};

export const getUserAttendance = async (USN) => {
  return await Attendance.find({ USN });
};

export const getUserAcademic = async (USN) => {
  return await Academic.findOne({ USN });
};