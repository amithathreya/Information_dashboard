"use client"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
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
    email?: string
  }
}

interface StudentCardProps {
  student: StudentSummary
  semester?: string
}

export function StudentCard({ student, semester = "8" }: StudentCardProps) {
  const router = useRouter()
  const initials = (student.name || student.usn || "?")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
  const handleClick = () => {
    router.push(`/admin/student/dashboard?usn=${student.usn}&semester=${semester}`)
  }

  return (
    <Card 
      className="hover:shadow-md hover:bg-slate-100 transition-colors transition-shadow w-full h-44 cursor-pointer"
      onClick={handleClick}
    >
      <div className="h-full px-3 py-2 flex items-stretch gap-3">
        {/* Left: Square image */}
        <div className="relative h-32 w-32 flex-shrink-0 rounded-xl overflow-hidden bg-muted self-center">
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
        <div className="flex-1 min-w-0 py-0">
          <div className="text-xs text-muted-foreground truncate">{student.department || "CSE"}</div>
          <div className="text-lg font-semibold truncate">{student.name}</div>
          <div className="mt-1 space-y-1 text-[13px]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium">USN:</span>
              <span className="truncate">{(student.usn || "").toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium">Mentor:</span>
              <span className="truncate">{student.personal?.mentor_name ?? "-"}</span>
            </div>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="w-px bg-border self-stretch" />

        {/* Right: Personal info (server now returns per-page students with `personal`) */}
        <div className="flex-[1.2] min-w-0 min-h-0 py-0 flex flex-col">
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
              <div className="font-medium">Address:</div>
              <div className="truncate">{student.personal?.address ?? "-"}</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="font-medium">Email:</div>
              <div className="truncate">{student.personal?.email ?? "-"}</div>
            </div>
          </div>
          <div className="text-[13px] flex items-center gap-1 mt-1">
            <span className="font-medium">Average Attendance:</span>
            <span>{student.avgAttendance?.toFixed(1) ?? "-"}%</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
