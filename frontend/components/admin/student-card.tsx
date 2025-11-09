"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface StudentSummary {
  name: string
  usn: string
  department?: string
  totalSubjects?: number
  avgMarks?: number
  avgAttendance?: number
}

interface StudentCardProps {
  student: StudentSummary
  onOpen: (usn: string) => void
}

export function StudentCard({ student, onOpen }: StudentCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition" onClick={() => onOpen(student.usn)}>
      <CardHeader>
        <CardDescription>{student.department || "CSE"}</CardDescription>
        <CardTitle className="text-lg font-semibold line-clamp-1">{student.name}</CardTitle>
      </CardHeader>
      <CardFooter className="flex flex-col items-start gap-2 text-xs">
        <div className="flex w-full justify-between">
          <span className="font-medium">USN:</span>
          <span>{student.usn}</span>
        </div>
        <div className="flex w-full justify-between">
          <span className="font-medium">Subjects:</span>
          <span>{student.totalSubjects ?? "-"}</span>
        </div>
        <div className="flex w-full justify-between">
          <span className="font-medium">Avg Marks:</span>
          <span>{student.avgMarks?.toFixed(1) ?? "-"}</span>
        </div>
        <div className="flex w-full justify-between">
          <span className="font-medium">Avg Attendance:</span>
          <span>{student.avgAttendance?.toFixed(1) ?? "-"}%</span>
        </div>
        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onOpen(student.usn); }}>Edit</Button>
      </CardFooter>
    </Card>
  )
}
