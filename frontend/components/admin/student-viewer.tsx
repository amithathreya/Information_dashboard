"use client"
import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export interface SubjectRecord {
  _id?: string
  subject_name: string
  subject_marks?: number
  classes_attended?: number
  classes_conducted?: number
  attendance?: number
}

interface StudentViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usn: string | null
  semester: string
  name?: string
  department?: string
  phone?: string
  tokenResolver?: () => string | null
  fetchEndpoint?: (usn: string, semester: string) => string
}

const defaultFetchEndpoint = (usn: string, semester: string) => `http://localhost:8080/users/getsemesterdata/${usn}?semester=${semester}`

export function StudentViewer({ open, onOpenChange, usn, semester, name, department, phone, tokenResolver, fetchEndpoint = defaultFetchEndpoint }: StudentViewerProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<SubjectRecord[]>([])

  const token = useMemo(() => tokenResolver?.() ?? (typeof window !== "undefined" ? (localStorage.getItem("token") || localStorage.getItem("jwt")) : null), [tokenResolver])

  useEffect(() => {
    if (!open || !usn) return
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(fetchEndpoint(usn, semester), { headers: { Authorization: token ? `Bearer ${token}` : "" } })
        if (!res.ok) {
          const txt = await res.text().catch(() => "")
          throw new Error(`Fetch failed (${res.status}) ${txt}`)
        }
        const data = await res.json()
        let arr: any[] = []
        if (Array.isArray(data)) arr = data
        else if (Array.isArray(data?.subjects)) arr = data.subjects
        else if (Array.isArray(data?.students)) {
          const match = data.students.find((st: any) => (st.usn || st.USN || "").toString() === (usn || "").toString())
          if (match && Array.isArray(match.subjects)) arr = match.subjects
        } else if (Array.isArray(data?.grades)) arr = data.grades
        else if (Array.isArray(data?.data)) arr = data.data
        if (!Array.isArray(arr)) arr = []
        const normalized = arr.map((s) => ({
          _id: (s as any)._id,
          subject_name: (s as any).subject_name || (s as any).Course_Name || "",
          subject_marks: Number((s as any).subject_marks ?? (s as any).marks ?? 0),
          classes_attended: Number((s as any).classes_attended ?? 0),
          classes_conducted: Number((s as any).classes_conducted ?? 0),
          attendance: Number((s as any).attendance ?? 0),
        }))
        setSubjects(normalized)
      } catch (e: any) {
        setError(e?.message || "Failed to load subjects")
        setSubjects([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [open, usn, semester, token, fetchEndpoint])

  const avgAttendance = subjects.length ? subjects.reduce((a, s) => a + (Number.isFinite(Number(s.attendance)) ? Number(s.attendance) : 0), 0) / subjects.length : undefined

  const fmtNum = (v: any) => (Number.isFinite(v) ? String(v) : "-")
  const toFinite = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : NaN)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl w-full max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Student Details{usn ? ` — ${usn}` : ""}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          {error && <div className="text-red-600 text-sm break-words">{error}</div>}
          <div className="text-sm grid grid-cols-2 gap-x-6 gap-y-1">
            <div className="flex gap-2"><span className="font-medium">Name:</span><span className="truncate">{name || "-"}</span></div>
            <div className="flex gap-2"><span className="font-medium">USN:</span><span>{usn || "-"}</span></div>
            <div className="flex gap-2"><span className="font-medium">Department:</span><span>{department || "CSE"}</span></div>
            <div className="flex gap-2"><span className="font-medium">Phone:</span><span>{(phone && String(phone).trim()) || "0000000000"}</span></div>
            <div className="flex gap-2"><span className="font-medium">Semester:</span><span>{semester}</span></div>
            <div className="flex gap-2"><span className="font-medium">Average Attendance:</span><span>{avgAttendance?.toFixed(1) ?? "-"}%</span></div>
          </div>
          <div className="overflow-auto -mx-1 px-1" style={{ maxHeight: "52vh" }}>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : subjects.length === 0 ? (
              <div className="text-sm text-muted-foreground">No subjects found for this student / semester.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-right">Marks</TableHead>
                    <TableHead className="text-right">Attended</TableHead>
                    <TableHead className="text-right">Conducted</TableHead>
                    <TableHead className="text-right">Attendance %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((s, idx) => (
                    <TableRow key={`${s._id || s.subject_name}-${idx}`}>
                      <TableCell className="font-medium max-w-[260px] truncate" title={s.subject_name}>{s.subject_name}</TableCell>
                      <TableCell className="text-right">{fmtNum(toFinite(s.subject_marks))}</TableCell>
                      <TableCell className="text-right">{fmtNum(toFinite(s.classes_attended))}</TableCell>
                      <TableCell className="text-right">{fmtNum(toFinite(s.classes_conducted))}</TableCell>
                      <TableCell className="text-right">{Number.isFinite(toFinite(s.attendance)) ? toFinite(s.attendance).toFixed(2) : "-"}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
        <DialogFooter>
          <div className="flex w-full justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
