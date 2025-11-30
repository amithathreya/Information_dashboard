import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import Record, { getRecordModel } from '../models/record.model.js';
import PersonalInfo from '../models/personal.model.js';

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
  if (!user) {
    console.debug(`loginUser: user not found for USN='${USN}'`);
    return { success: false, reason: 'not_found' };
  }
  try {
    if (!user.password) {
      console.debug(`loginUser: user record for USN='${USN}' has no password field`);
      return { success: false, reason: 'no_password' };
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) console.debug(`loginUser: password mismatch for USN='${USN}'`);
    return { success: match, reason: match ? 'ok' : 'mismatch' };
  } catch (err) {
    // rethrow so controller can return diagnostic info
    console.error('loginUser: error verifying password for USN=', USN, err);
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

export const getUserSemesterData = async (USN, upperSemester, lowerSemester) => {
  const results = [];
  for (let s = upperSemester; s >= lowerSemester; s--) {
    const model = getRecordModel({ semester: s });

    const Model = (typeof model.then === 'function') ? await model : model;
    try {

  const filter = buildUsnFilter(USN);
  const docs = await Model.find(filter).lean();
      if (docs && docs.length) {
        results.push(...docs);
      }
    } catch (err) {

    }
  }
  return results;
};


export const getUserPersonalDetails = async (USN) => {
  if (!USN) return null;
  const trimmed = String(USN).trim();
  const esc = escapeRegex(trimmed);
  const filter = {
    $or: [
      { USN: trimmed },
      { usn: trimmed },
      { USN: { $regex: `^${esc}$`, $options: 'i' } },
      { usn: { $regex: `^${esc}$`, $options: 'i' } }
    ]
  };
  return await PersonalInfo.findOne(filter).lean();
};
