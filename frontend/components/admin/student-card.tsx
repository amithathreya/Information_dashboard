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
  personal?: {
    _id?: string
    usn?: string
    age?: number
    address?: string
    phone_number?: string
    mentor_name?: string
  }
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
    <Card className="hover:shadow-md hover:bg-slate-100 transition-colors transition-shadow w-full h-56">
  <div className="h-full px-3 py-0 flex items-stretch gap-2">
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
        <div className="flex-[1.2] min-w-0 py-0">
          <div className="text-sm text-muted-foreground truncate">{student.department || "CSE"}</div>
          <div className="text-xl font-semibold truncate">{student.name}</div>
          <div className="mt-0 space-y-1 text-[13px]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium">USN:</span>
              <span className="truncate">{(student.usn || "").toUpperCase()}</span>
            </div>
          </div>
          <div className="pt-1 flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="hover:bg-slate-100 hover:scale-[1.02] transition-transform"
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
              className="bg-green-700 text-white hover:bg-green-100 hover:text-green-700 hover:scale-[1.02] transition-colors transition-transform"
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

        {/* Right: Personal info (server now returns per-page students with `personal`) */}
        <div className="flex-[1.2] min-w-0 min-h-0 py-0 flex flex-col justify-between">
          <div className="flex-1 min-h-0 overflow-auto px-0 py-0 space-y-1 text-[13px]">
            <div className="flex items-start gap-2">
              <div className="font-medium">Age:</div>
              <div className="truncate">{student.personal?.age ?? "-"}</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="font-medium">Phone:</div>
              <div className="truncate">{student.personal?.phone_number ?? student.phone ?? "0000000000"}</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="font-medium">Mentor:</div>
              <div className="truncate">{student.personal?.mentor_name ?? "-"}</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="font-medium">Address:</div>
              <div className="truncate">{student.personal?.address ?? "-"}</div>
            </div>
          </div>
          <div className="text-[13px] flex items-center gap-1">
            <span className="font-medium">Average Attendance:</span>
            <span>{student.avgAttendance?.toFixed(1) ?? "-"}%</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
