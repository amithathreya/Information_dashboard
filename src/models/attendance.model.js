import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    USN: { type: String, required: true },
    Course_Code: { type: String, required: true },
    Course_Name: { type: String, required: true },
    AttendancePct: { type: Number, required: true },
  },
  { collection: "course_attendance" }
);

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);

export default Attendance;