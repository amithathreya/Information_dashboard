"use client"
import { useCallback, useEffect, useMemo, useState } from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { StudentCard, StudentSummary } from "@/components/admin/student-card"
import { StudentEditor } from "@/components/admin/student-editor"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

/*
  Admin Dashboard Page
  Assumptions:
  - Endpoint to list students for a semester: GET http://localhost:8080/admin/students?semester=<n>
    Returns: Array<{ name, usn, department, subjects: [{ subject_name, subject_marks, classes_attended, classes_conducted, attendance }] }>
  - Endpoint to update student subjects (bulk): PATCH http://localhost:8080/admin/updateSemesterSubjects/:usn?semester=<n>
    Body: { subjects: [...] }
  Adjust fetch URLs below if your backend routes differ.
*/

interface RawStudent {
  name?: string
  Name?: string
  usn?: string
  USN?: string
  department?: string
  Department?: string
  subjects?: any[]
}

export default function AdminPage() {
  const [semester, setSemester] = useState<string>("8")
  const [mode, setMode] = useState<"grouped" | "raw">("grouped")
  const [students, setStudents] = useState<StudentSummary[]>([])
  const [rawCount, setRawCount] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedUSN, setSelectedUSN] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const token = useMemo(() => (typeof window !== "undefined" ? (localStorage.getItem("token") || localStorage.getItem("jwt")) : null), [])

  const fetchStudents = useCallback(async (sem: string, m: "grouped" | "raw" = mode) => {
    setLoading(true)
    setError(null)
    try {
      // Admin read endpoints now support `debug=raw` and a dedicated /subjects route.
      // We default to grouped view; for raw we build summaries client-side.
      const url = m === "raw"
        ? `http://localhost:8080/admin/students?semester=${sem}&debug=raw`
        : `http://localhost:8080/admin/students?semester=${sem}`
      const res = await fetch(url, {
        // Read is public in backend; if token exists we still send it.
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      })
      if (!res.ok) throw new Error(`Failed ${res.status}`)
      const json = await res.json()
      if (m === "grouped") {
        const data: RawStudent[] = Array.isArray(json?.students) ? json.students : Array.isArray(json) ? json : []
        const mapped: StudentSummary[] = data.map((st) => {
          const subs = Array.isArray((st as any).subjects) ? (st as any).subjects : []
          const marks = subs.map((s: any) => Number(s.subject_marks ?? s.marks ?? 0)).filter((n: number) => !isNaN(n))
          const avgMarks = marks.length ? marks.reduce((a: number, b: number) => a + b, 0) / marks.length : undefined
          const atts = subs.map((s: any) => Number(s.attendance ?? 0)).filter((n: number) => !isNaN(n))
          const avgAttendance = atts.length ? atts.reduce((a: number, b: number) => a + b, 0) / atts.length : undefined
          return {
            name: (st as any).name || (st as any).Name || "",
            usn: (st as any).usn || (st as any).USN || "",
            department: (st as any).department || (st as any).Department || "CSE",
            totalSubjects: subs.length,
            avgMarks,
            avgAttendance,
          }
        })
        setStudents(mapped)
        setRawCount(Array.isArray(json?.meta?.totalDocs) ? json.meta.totalDocs : Array.isArray(json) ? json.length : 0)
      } else {
        // Raw mode returns subject documents directly; group client-side by canonical USN for cards
        const raw: any[] = Array.isArray(json) ? json : []
        setRawCount(raw.length)
        const byUSN = new Map<string, { name: string; dept?: string; subjects: any[] }>()
        for (const doc of raw) {
          const usn = (doc.USN || doc.usn || "").toString()
          if (!usn) continue
          const entry = byUSN.get(usn) || { name: doc.name || doc.Name || "", dept: doc.department || doc.Department || "CSE", subjects: [] as any[] }
          entry.subjects.push(doc)
          if (!entry.name) entry.name = doc.name || doc.Name || ""
          if (!entry.dept) entry.dept = doc.department || doc.Department || "CSE"
          byUSN.set(usn, entry)
        }
        const mapped: StudentSummary[] = Array.from(byUSN.entries()).map(([usn, v]) => {
          const marks = v.subjects.map((s: any) => Number(s.subject_marks ?? s.marks ?? 0)).filter((n: number) => !isNaN(n))
          const avgMarks = marks.length ? marks.reduce((a: number, b: number) => a + b, 0) / marks.length : undefined
          const atts = v.subjects.map((s: any) => Number(s.attendance ?? 0)).filter((n: number) => !isNaN(n))
          const avgAttendance = atts.length ? atts.reduce((a: number, b: number) => a + b, 0) / atts.length : undefined
          return { name: v.name, usn, department: v.dept || "CSE", totalSubjects: v.subjects.length, avgMarks, avgAttendance }
        })
        setStudents(mapped)
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load students")
      setStudents([])
    } finally {
      setLoading(false)
    }
  }, [token, mode])

  useEffect(() => {
    fetchStudents(semester, mode)
  }, [semester, mode, fetchStudents])

  const stats = useMemo(() => {
    const count = students.length
    const overallAvgMarks = students.reduce((acc, s) => acc + (s.avgMarks ?? 0), 0) / (students.filter(s => s.avgMarks !== undefined).length || 1)
    const overallAvgAttendance = students.reduce((acc, s) => acc + (s.avgAttendance ?? 0), 0) / (students.filter(s => s.avgAttendance !== undefined).length || 1)
    return {
      count,
      overallAvgMarks: isNaN(overallAvgMarks) ? 0 : overallAvgMarks,
      overallAvgAttendance: isNaN(overallAvgAttendance) ? 0 : overallAvgAttendance,
    }
  }, [students])

  const openEditor = (usn: string) => {
    setSelectedUSN(usn)
    setEditorOpen(true)
  }

  const handleSaved = () => {
    fetchStudents(semester) // refresh list after save
  }

  return (
    <SidebarProvider>
      <SidebarInset>
        <SiteHeader />
        <div className="p-6 space-y-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <div className="text-sm font-medium">Semester</div>
              <Select value={semester} onValueChange={(v) => setSemester(v)}>
                <SelectTrigger className="min-w-[120px]"><SelectValue placeholder="Semester" /></SelectTrigger>
                <SelectContent>
                  {["1","2","3","4","5","6","7","8"].map(s => (
                    <SelectItem key={s} value={s}>Semester {s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Mode</div>
              <Select value={mode} onValueChange={(v) => setMode(v as any)}>
                <SelectTrigger className="min-w-[140px]"><SelectValue placeholder="Mode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="grouped">Grouped (by student)</SelectItem>
                  <SelectItem value="raw">Raw documents</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => fetchStudents(semester)} disabled={loading}>Reload</Button>
            {loading && <div className="text-sm text-muted-foreground">Loading students…</div>}
            {error && <div className="text-sm text-red-600">{error}</div>}
          </div>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Students</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{stats.count}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Avg Marks</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{stats.overallAvgMarks.toFixed(1)}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Avg Attendance %</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{stats.overallAvgAttendance.toFixed(1)}</CardContent>
            </Card>
            {mode === "raw" && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Raw Docs</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold">{rawCount}</CardContent>
              </Card>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {students.map(st => (
              <StudentCard key={st.usn} student={st} onOpen={openEditor} />
            ))}
            {!loading && students.length === 0 && (
              <div className="text-sm text-muted-foreground col-span-full">No students found for semester {semester}.</div>
            )}
          </div>
        </div>
      </SidebarInset>
      <StudentEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        usn={selectedUSN}
        semester={semester}
        onSaved={handleSaved}
      />
    </SidebarProvider>
  )
}
