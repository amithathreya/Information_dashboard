import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import Record, { getRecordModel } from '../models/record.model.js';

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildUsnFilter(USN) {
  if (!USN) return {};
  const trimmed = String(USN).trim();
  const esc = escapeRegex(trimmed);
  return {
    $or: [
      { USN: trimmed },
      { usn: trimmed },
      { USN: { $regex: `^${esc}$`, $options: 'i' } },
      { usn: { $regex: `^${esc}$`, $options: 'i' } }
    ]
  };
}

export const getAllUsers = async () => {
  return await User.find({}, 'USN');
};

export const loginUser = async (USN, password) => {
  if (!USN || !password) return { success: false };
  const filter = buildUsnFilter(USN);
  const user = await User.findOne(filter);
  if (!user) return { success: false };
  try {
    const match = await bcrypt.compare(password, user.password);
    return { success: match };
  } catch (err) {
    // rethrow so controller can return diagnostic info
    throw new Error('Error verifying password: ' + (err.message || err));
  }
};

export const registerUser = async (USN, password) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const newUser = new User({ USN, password: hashedPassword });
  await newUser.save();
  return { success: true };
};
export const getUserInfo = async (USN, opts = {}) => {
  // opts may contain { semester, collectionName }
  const Model = await getRecordModel(opts);
  const filter = buildUsnFilter(USN);
  return await Model.findOne(filter);
};

export const getUserGrades = async (USN, opts = {}) => {
  const Model = await getRecordModel(opts);
  const filter = buildUsnFilter(USN);
  return await Model.find(filter);
};

export const getUserAttendance = async (USN, opts = {}) => {
  const Model = await getRecordModel(opts);
  const filter = buildUsnFilter(USN);
  return await Model.find(filter);
};

export const getUserAcademic = async (USN, opts = {}) => {
  const Model = await getRecordModel(opts);
  const filter = buildUsnFilter(USN);
  return await Model.findOne(filter);
};

/**
 * Aggregate records for a USN across semesters from upper down to lower (inclusive).
 * Searches collections named `semester_<n>` for each semester in range and accumulates records.
 * @param {string} USN
 * @param {number} upperSemester
 * @param {number} lowerSemester
 * @returns {Promise<Array>} array of records found across semesters
 */
export const getUserSemesterData = async (USN, upperSemester, lowerSemester) => {
  const results = [];
  for (let s = upperSemester; s >= lowerSemester; s--) {
    const model = getRecordModel({ semester: s });
    // getRecordModel may return a model or a Promise; handle either
    const Model = (typeof model.then === 'function') ? await model : model;
    try {
      // use lean() so we get plain JSON objects that can be forwarded as-is
  const filter = buildUsnFilter(USN);
  const docs = await Model.find(filter).lean();
      if (docs && docs.length) {
        // append raw documents directly so the frontend receives the exact stored JSON
        results.push(...docs);
      }
    } catch (err) {
      // ignore missing collection errors and continue
    }
  }
  return results;
};
