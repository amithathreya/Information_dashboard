import mongoose from 'mongoose';

const gradesSchema = new mongoose.Schema(
  {
    USN: { type: String, required: true },
    Course_Code: { type: String, required: true },
    Course_Name: { type: String, required: true },
    GradePoint: { type: Number, required: true },
    LetterGrade: { type: String, required: true },
  },
  { collection: "course_grades" }
);

const Grades = mongoose.models.Grades || mongoose.model('Grades', gradesSchema);

export default Grades;