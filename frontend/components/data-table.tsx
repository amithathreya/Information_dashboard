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
            <TableHead className="w-[160px]">Subject</TableHead>
            <TableHead className="w-[60px] text-center">IA1</TableHead>
            <TableHead className="w-[60px] text-center">IA2</TableHead>
            <TableHead className="w-[60px] text-center">IA3</TableHead>
            <TableHead className="w-[80px] text-center">Assignment</TableHead>
            <TableHead className="w-[60px] text-center">SEE</TableHead>
            <TableHead className="w-[80px] text-center">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gradesData.map((row, idx) => (
            <TableRow key={`${row.subject_name || 'subject'}-${idx}`}>
              <TableCell className="font-medium">{row.subject_name}</TableCell>
              <TableCell className="text-center">{row.IA1 ?? row.ia1 ?? "-"}</TableCell>
              <TableCell className="text-center">{row.IA2 ?? row.ia2 ?? "-"}</TableCell>
              <TableCell className="text-center">{row.IA3 ?? row.ia3 ?? "-"}</TableCell>
              <TableCell className="text-center">{row.assignment_marks ?? "-"}</TableCell>
              <TableCell className="text-center">{row.SEE_marks ?? row.see ?? "-"}</TableCell>
              <TableCell className="text-center">
                {(() => {
                  const ia1 = Number(row.IA1 ?? row.ia1 ?? 0);
                  const ia2 = Number(row.IA2 ?? row.ia2 ?? 0);
                  const ia3 = Number(row.IA3 ?? row.ia3 ?? 0);
                  const assign = Number(row.assignment_marks ?? 0);
                  const see = Number(row.SEE_marks ?? row.see ?? 0);
                  const iaAvg = (ia1 + ia2 + ia3) / 3;
                  const total = Math.round(iaAvg + assign + see);
                  return total || "-";
                })()}
              </TableCell>
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
