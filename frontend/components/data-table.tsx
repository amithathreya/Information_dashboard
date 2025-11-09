import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"



interface DataTableProps {
  name: string;
  usn: string;
  department: string;
  academicYear: string;
  gradesData?: any[];
}

export function DataTable(props: DataTableProps) {
  const { name, usn, department, academicYear, gradesData = [] } = props;

  // Determine data shape: older API returns grade rows with Course_Code, Course_Name, etc.
  // New backend (subject records) returns rows with subject_name, subject_marks, classes_conducted, classes_attended, attendance
  const isSubjectRecords = gradesData.length > 0 && gradesData[0].subject_name !== undefined;

  if (isSubjectRecords) {
    return (
      <Table>
        <TableCaption>Subjects and marks for the current semester</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Subject</TableHead>
            <TableHead className="w-[120px]">Marks</TableHead>
            <TableHead className="w-[160px]">Classes Attended</TableHead>
            <TableHead className="w-[160px]">Classes Conducted</TableHead>
            <TableHead className="text-right">Attendance %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gradesData.map((row, idx) => (
            <TableRow key={`${row.subject_name || 'subject'}-${idx}`}>
              <TableCell className="font-medium">{row.subject_name}</TableCell>
              <TableCell>{row.subject_marks}</TableCell>
              <TableCell>{row.classes_attended}</TableCell>
              <TableCell>{row.classes_conducted}</TableCell>
              <TableCell className="text-right">{row.attendance}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  // Fallback to original grades table
  return (
    <Table>
      <TableCaption>A list of your registered courses</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Course Code</TableHead>
          <TableHead>Course Name</TableHead>
          <TableHead>Letter Grade</TableHead>
          <TableHead className="text-right">Grade Point</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {gradesData.map((row, idx) => (
          <TableRow key={row.Course_Code || idx}>
            <TableCell className="font-medium">{row.Course_Code}</TableCell>
            <TableCell>{row.Course_Name}</TableCell>
            <TableCell>{row.LetterGrade}</TableCell>
            <TableCell className="text-right">{row.GradePoint}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
