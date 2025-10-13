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

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
]

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
