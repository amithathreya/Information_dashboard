import mongoose from 'mongoose';

const academicSchema = new mongoose.Schema(
  {
    USN: { type: String, required: true, unique: true },
    PreviousSemesterGPA: { type: Number, required: true },
    CumulativeGPA: { type: Number, required: true },
  },
  { collection: "academic_records" }
);

const Academic = mongoose.models.Academic || mongoose.model('Academic', academicSchema);

export default Academic;