import mongoose from 'mongoose';
import { getRecordModel } from '../models/record.model.js';

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
