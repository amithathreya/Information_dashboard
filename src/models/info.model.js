import mongoose from 'mongoose';

const infoSchema = new mongoose.Schema(
  {
    USN: { type: String, required: true },
    Name: { type: String, required: true },
    Department: { type: String, required: true },
    AdmissionYear: { type: Number, required: true },
    AcademicYear: { type: Number, required: true },
  },
  { collection: "students_info" }
);

const Info = mongoose.model('Info', infoSchema);

export default Info;  