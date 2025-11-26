import mongoose from 'mongoose';
import { getRecordModel } from '../models/record.model.js';
import bcrypt from 'bcrypt';
import Admin from '../models/admin.model.js';
import PersonalInfo from '../models/personal.model.js';

/**
 * List students for a given semester.
 * Groups records by USN and aggregates per-student stats and subjects array.
 * @param {number|string} semester
 * @returns {Promise<Array>} array of student summary objects
 */
export async function listStudentsBySemester(semester) {
  if (!semester) throw new Error('semester required');
  const Model = getRecordModel({ semester });

  // Pipeline: group all subject rows under same USN
  const pipeline = [
    { $match: { } }, // all docs in semester collection
    // Build a canonical, lowercased USN supporting both 'USN' and 'usn'
    { $addFields: { canonicalUSN: { $toLower: { $ifNull: ['$USN', '$usn'] } } } },
    { $match: { canonicalUSN: { $ne: null } } },
    {
      $group: {
        _id: '$canonicalUSN',
        name: { $first: '$name' },
        subjects: {
          $push: {
            subject_name: '$subject_name',
            subject_marks: '$subject_marks',
            classes_conducted: '$classes_conducted',
            classes_attended: '$classes_attended',
            attendance: '$attendance'
          }
        },
        avgMarks: { $avg: '$subject_marks' },
        avgAttendance: { $avg: '$attendance' },
        subjectsCount: { $sum: 1 }
      }
    },
      // Join personal details from `personal_details` collection by USN
      {
        $lookup: {
            from: 'personal_information',
            let: { usn_lower: '$_id' },
            pipeline: [
              { $addFields: { usn_lower: { $toLower: { $ifNull: ['$USN', '$usn'] } } } },
              { $match: { $expr: { $eq: ['$usn_lower', '$$usn_lower'] } } },
              { $project: { usn_lower: 0 } }
            ],
            as: 'personal'
        }
      },
      { $addFields: { personal: { $arrayElemAt: ['$personal', 0] } } },
    {
      $project: {
        USN: '$_id',
        _id: 0,
        name: 1,
        subjects: 1,
        avgMarks: { $round: ['$avgMarks', 2] },
        avgAttendance: { $round: ['$avgAttendance', 2] },
          personal: 1,
        subjectsCount: 1
      }
    },
    { $sort: { USN: 1 } }
  ];

  return await Model.aggregate(pipeline);
}

/**
 * Generalized student list supporting semester or explicit collection name.
 * Keeps the same aggregation pipeline.
 */
export async function listStudents({ semester, collectionName, USN } = {}) {
  if (!semester && !collectionName) throw new Error('semester or collectionName required');
  const Model = getRecordModel({ semester, collectionName });
  const pipeline = [
    { $match: {} },
    { $addFields: { canonicalUSN: { $toLower: { $ifNull: ['$USN', '$usn'] } } } },
    // If a USN filter is provided, match it after canonicalUSN is available (normalize provided USN)
    ...(USN ? [{ $match: { canonicalUSN: USN.toLowerCase() } }] : []),
    { $match: { canonicalUSN: { $ne: null } } },
    {
      $group: {
        _id: '$canonicalUSN',
        name: { $first: '$name' },
        subjects: {
          $push: {
            subject_name: '$subject_name',
            subject_marks: '$subject_marks',
            classes_conducted: '$classes_conducted',
            classes_attended: '$classes_attended',
            attendance: '$attendance'
          }
        },
        avgMarks: { $avg: '$subject_marks' },
        avgAttendance: { $avg: '$attendance' },
        subjectsCount: { $sum: 1 }
      }
    },
    // Join personal details from `personal_information` collection by USN (case-insensitive)
    {
      $lookup: {
        from: 'personal_information',
        let: { usn_lower: '$_id' },
        pipeline: [
          { $addFields: { usn_lower: { $toLower: { $ifNull: ['$USN', '$usn'] } } } },
          { $match: { $expr: { $eq: ['$usn_lower', '$$usn_lower'] } } },
          { $project: { usn_lower: 0 } }
        ],
        as: 'personal'
      }
    },
    { $addFields: { personal: { $arrayElemAt: ['$personal', 0] } } },
    {
      $project: {
        USN: '$_id',
        _id: 0,
        name: 1,
        subjects: 1,
        avgMarks: { $round: ['$avgMarks', 2] },
        avgAttendance: { $round: ['$avgAttendance', 2] },
        personal: 1,
        subjectsCount: 1
      }
    },
    { $sort: { USN: 1 } }
  ];

  return await Model.aggregate(pipeline);
}

export async function countDocs({ semester, collectionName } = {}) {
  if (!semester && !collectionName) throw new Error('semester or collectionName required');
  const Model = getRecordModel({ semester, collectionName });
  return await Model.countDocuments({});
}

// Return raw subject documents for a semester or explicit collection
export async function listRawRecords({ semester, collectionName } = {}) {
  if (!semester && !collectionName) throw new Error('semester or collectionName required');
  const Model = getRecordModel({ semester, collectionName });
  return await Model.find({}).lean();
}

/**
 * Bulk update subjects for a given student & semester.
 * Strategy: For each subject in array, upsert by (USN, subject_name).
 * Recalculate attendance field as (classes_attended / classes_conducted) * 100 (rounded 2).
 * @param {string} USN
 * @param {number|string} semester
 * @param {Array} subjects - array of { subject_name, subject_marks, classes_attended, classes_conducted }
 */
export async function updateSemesterSubjects(USN, semester, subjects) {
  if (!USN) throw new Error('USN required');
  if (!semester) throw new Error('semester required');
  if (!Array.isArray(subjects)) throw new Error('subjects must be array');

  const Model = getRecordModel({ semester });
  // Try to get an existing name for USN to preserve required field on upserts
  const existing = await Model.findOne({ USN }).select('name').lean();
  const defaultName = existing?.name;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    for (const subj of subjects) {
      const {
        subject_name,
        subject_marks = 0,
        classes_attended = 0,
        classes_conducted = 0
      } = subj;
      if (!subject_name) continue; // skip invalid row
      const attendance = classes_conducted > 0 ? Number(((classes_attended / classes_conducted) * 100).toFixed(2)) : 0;

      // Update all matching rows for this (USN, subject_name) in a case-insensitive way.
      // Some documents store USN under `USN` or `usn`, and casing may vary. Use $expr
      // with $toLower + $ifNull to match the normalized USN across documents.
      const usnLower = String(USN).toLowerCase();
      const filter = {
        $expr: {
          $and: [
            { $eq: ['$subject_name', subject_name] },
            { $eq: [ { $toLower: { $ifNull: ['$USN', '$usn'] } }, usnLower ] }
          ]
        }
      };

      // Try to update existing documents (case-insensitive match). Do NOT use upsert
      // with an $expr filter because MongoDB disallows that. If no documents matched,
      // insert a new document explicitly within the same session.
      const updateResult = await Model.updateMany(
        filter,
        {
          $set: {
            name: subj.name || defaultName,
            subject_marks,
            classes_attended,
            classes_conducted,
            attendance
          }
        },
        { session, runValidators: false }
      );

      // If nothing matched, create a new subject row using the canonical `USN` field.
      // Use `create` with the session so the operation is part of the transaction.
      const matched = (updateResult && (updateResult.matchedCount || updateResult.n || updateResult.nMatched)) || 0;
      if (!matched) {
        const newDoc = {
          USN,
          name: subj.name || defaultName,
          subject_name,
          subject_marks,
          classes_attended,
          classes_conducted,
          attendance
        };
        await Model.create([newDoc], { session });
      }
    }
    await session.commitTransaction();
    session.endSession();
    // Return updated docs for confirmation. Match case-insensitively against stored `USN` or `usn`.
    const usnLower = String(USN).toLowerCase();
    return await Model.find({
      $expr: { $eq: [ { $toLower: { $ifNull: ['$USN', '$usn'] } }, usnLower ] }
    }).lean();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

// ----- Admin auth helpers -----
/**
 * Register an admin user.
 * Stores username and hashed password in `admin` collection.
 */
export async function registerAdmin(username, password) {
  if (!username || !password) throw new Error('username and password required');
  const exists = await Admin.findOne({ username }).lean();
  if (exists) throw new Error('admin already exists');
  const saltRounds = 10;
  const hashed = await bcrypt.hash(password, saltRounds);
  const doc = new Admin({ username, password: hashed });
  await doc.save();
  return { success: true };
}

/**
 * Verify admin credentials.
 * Returns { success: boolean, reason?: string }
 */
export async function loginAdmin(username, password) {
  if (!username || !password) return { success: false };
  const admin = await Admin.findOne({ username });
  if (!admin) return { success: false, reason: 'not_found' };
  if (!admin.password) return { success: false, reason: 'no_password' };
  try {
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return { success: false, reason: 'mismatch' };
    return { success: true };
  } catch (err) {
    console.error('loginAdmin error:', err);
    throw err;
  }
}

/**
 * Update a single document in a semester collection (semester_1..8) or personal_information.
 * Matches by USN (case-insensitive) or _id.
 * @param {string} collection - collection name: 'semester_1'..'semester_8' or 'personal_information'
 * @param {string} identifier - USN or _id value
 * @param {Object} updates - fields to $set
 * @returns {Promise<Object>} updated document
 */
export async function updateCollectionRecord(collection, identifier, updates) {
  if (!collection) throw new Error('collection is required');
  if (!identifier) throw new Error('identifier (USN or _id) is required');
  if (!updates || typeof updates !== 'object') throw new Error('updates object is required');

  // Determine the model
  let Model;
  if (collection === 'personal_information') {
    Model = PersonalInfo;
  } else if (/^semester_[1-8]$/.test(collection)) {
    const semester = collection.split('_')[1];
    Model = getRecordModel({ semester });
  } else {
    throw new Error('Invalid collection. Must be semester_1..semester_8 or personal_information');
  }

  // Build filter: try _id first, else USN (case-insensitive)
  let filter;
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    filter = { _id: identifier };
  } else {
    const idLower = String(identifier).toLowerCase();
    filter = {
      $expr: { $eq: [{ $toLower: { $ifNull: ['$USN', '$usn'] } }, idLower] }
    };
  }

  // Remove _id from updates if present (can't change _id)
  const { _id, ...safeUpdates } = updates;

  const result = await Model.findOneAndUpdate(filter, { $set: safeUpdates }, { new: true, runValidators: false }).lean();
  if (!result) throw new Error('Document not found');
  return result;
}

/**
 * Convenience: update personal_information by USN.
 */
export async function updatePersonalInfo(USN, updates) {
  return updateCollectionRecord('personal_information', USN, updates);
}
