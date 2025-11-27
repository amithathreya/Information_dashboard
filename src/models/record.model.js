import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    USN: { type: String, required: true, index: true },
    subject_name: { type: String, required: true },
    subject_marks: { type: Number },
    classes_conducted: { type: Number },
    classes_attended: { type: Number },
    attendance: { type: Number },
    IA1: { type: Number },
    IA2: { type: Number },
    IA3: { type: Number },
    assignment_marks: { type: Number },
    IA_average: { type: Number },
    SEE_marks: { type: Number }
  },
  { collection: 'student_records', strict: false }
);

const defaultCollectionName = 'semester_8';
const DefaultModelName = `Record__${defaultCollectionName}`;
const DefaultRecord = mongoose.models[DefaultModelName] || mongoose.model(DefaultModelName, recordSchema, defaultCollectionName);

/**
 * Get a Record model for a specific collection.
 * If neither semester nor collectionName is provided, returns the model bound to `semester_8`.
 * If collectionName is provided, returns/creates a model bound to that collection.
 * If semester is provided, builds a candidate collection name like `semester_${semester}` and uses it.
 *
 * @param {Object} opts
 * @param {string|number} [opts.semester]
 * @param {string} [opts.collectionName]
 * @returns {mongoose.Model}
 */
export function getRecordModel({ semester, collectionName } = {}) {
  if (collectionName) {
    const modelName = `Record__${collectionName}`;
    return mongoose.models[modelName] || mongoose.model(modelName, recordSchema, collectionName);
  }

  if (semester) {
    const col = `semester_${semester}`;
    const modelName = `Record__${col}`;
    return mongoose.models[modelName] || mongoose.model(modelName, recordSchema, col);
  }

  // default to semester_8 collection
  return DefaultRecord;
}

export default DefaultRecord;
