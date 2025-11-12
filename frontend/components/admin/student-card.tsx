"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export interface StudentSummary {
  name: string
  usn: string
  department?: string
  totalSubjects?: number
  avgAttendance?: number
  imageUrl?: string
  phone?: string
  subjects?: { name: string; marks: number }[]
}

interface StudentCardProps {
  student: StudentSummary
  onOpen: (usn: string) => void
  onView?: (usn: string) => void
}

export function StudentCard({ student, onOpen, onView }: StudentCardProps) {
  const initials = (student.name || student.usn || "?")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition w-full h-56"
      onClick={() => onOpen(student.usn)}
    >
      <div className="h-full p-3 flex items-stretch gap-4">
        {/* Left: Square image with inner margins */}
        <div className="relative h-full aspect-square rounded-xl overflow-hidden bg-muted">
          {student.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={student.imageUrl}
              alt={student.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Avatar className="h-16 w-16 rounded-md">
                <AvatarFallback className="rounded-md text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>

        {/* Middle: Personal info */}
        <div className="flex-[1.2] min-w-0 py-1">
          <div className="text-sm text-muted-foreground truncate">{student.department || "CSE"}</div>
          <div className="text-xl font-semibold truncate">{student.name}</div>
          <div className="mt-2 space-y-1 text-[13px]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium">Phone:</span>
              <span className="truncate">{(student.phone && String(student.phone).trim()) || "0000000000"}</span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium">USN:</span>
              <span className="truncate">{student.usn}</span>
            </div>
          </div>
          <div className="pt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onOpen(student.usn)
              }}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation()
                onView?.(student.usn)
              }}
            >
              View
            </Button>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="w-px bg-border self-stretch" />

        {/* Right: Academic details */}
        <div className="flex-[1.2] min-w-0 py-1 flex flex-col justify-between">
          <div className="text-[13px] min-h-0">
            <div className="mt-0 max-h-28 overflow-auto px-0 py-0 space-y-0">
              {(student.subjects ?? []).map((sub, idx) => (
                <div key={idx} className="flex items-center gap-1 min-w-0">
                  <span className="truncate flex-1" title={sub.name}>{sub.name}</span>
                  <span className="font-medium tabular-nums">{isNaN(sub.marks) ? "-" : sub.marks}</span>
                </div>
              ))}
              {(!student.subjects || student.subjects.length === 0) && (
                <div className="text-muted-foreground">No subject marks</div>
              )}
            </div>
          </div>
          <div className="pt-0 text-[13px] flex items-center gap-1">
            <span className="font-medium">Average Attendance:</span>
            <span>{student.avgAttendance?.toFixed(1) ?? "-"}%</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
