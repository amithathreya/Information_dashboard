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
  // Debug: show raw gradesData for troubleshooting
  return (
    <>
      
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
    </>
  )
}
