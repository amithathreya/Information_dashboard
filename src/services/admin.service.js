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
    // Build a canonical USN supporting both 'USN' and 'usn'
    { $addFields: { canonicalUSN: { $ifNull: ['$USN', '$usn'] } } },
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
    {
      $project: {
        USN: '$_id',
        _id: 0,
        name: 1,
        subjects: 1,
        avgMarks: { $round: ['$avgMarks', 2] },
        avgAttendance: { $round: ['$avgAttendance', 2] },
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
export async function listStudents({ semester, collectionName } = {}) {
  if (!semester && !collectionName) throw new Error('semester or collectionName required');
  const Model = getRecordModel({ semester, collectionName });
  const pipeline = [
    { $match: {} },
    { $addFields: { canonicalUSN: { $ifNull: ['$USN', '$usn'] } } },
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
    {
      $project: {
        USN: '$_id',
        _id: 0,
        name: 1,
        subjects: 1,
        avgMarks: { $round: ['$avgMarks', 2] },
        avgAttendance: { $round: ['$avgAttendance', 2] },
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

      await Model.updateOne(
        { USN, subject_name },
        {
          $set: {
            name: subj.name || defaultName, // ensure name is present on upsert
            subject_marks,
            classes_attended,
            classes_conducted,
            attendance
          }
        },
        { upsert: true, session, runValidators: false }
      );
    }
    await session.commitTransaction();
    session.endSession();
    // Return updated docs for confirmation
    return await Model.find({ USN }).lean();
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}
