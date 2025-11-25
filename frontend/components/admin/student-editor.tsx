"use client"
import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export interface SubjectRecord {
  _id?: string
  subject_name: string
  subject_marks?: number
  classes_attended?: number
  classes_conducted?: number
  attendance?: number
}

interface StudentEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usn: string | null
  semester: string
  tokenResolver?: () => string | null
  fetchEndpoint?: (usn: string, semester: string) => string
  saveEndpoint?: (usn: string, semester: string) => string
  onSaved?: () => void
}

const defaultFetchEndpoint = (usn: string, semester: string) => `http://localhost:8080/users/getsemesterdata/${usn}?semester=${semester}`
// Bulk update endpoint for per-student semester subjects.
// Use the update route: PATCH /admin/updateSemesterSubjects/:usn?semester=<n>
const defaultSaveEndpoint = (usn: string, semester: string) => `http://localhost:8080/admin/updateSemesterSubjects/${usn}?semester=${semester}`

export function StudentEditor({ open, onOpenChange, usn, semester, tokenResolver, fetchEndpoint = defaultFetchEndpoint, saveEndpoint = defaultSaveEndpoint, onSaved }: StudentEditorProps) {
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
        // Try several shapes:
        // 1. Direct array (raw mode)
        // 2. { subjects: [...] }
        // 3. { students: [{ subjects: [...] }, ...] }
        // 4. { grades: [...] } or { data: [...]} fallback
        let arr: any[] = []
        if (Array.isArray(data)) arr = data
        else if (Array.isArray(data?.subjects)) arr = data.subjects
        else if (Array.isArray(data?.students)) {
          // Find matching student by usn
          const match = data.students.find((st: any) => {
            const u = st.usn || st.USN
            return u && usn && u.toString() === usn.toString()
          })
          if (match && Array.isArray(match.subjects)) arr = match.subjects
        } else if (Array.isArray(data?.grades)) arr = data.grades
        else if (Array.isArray(data?.data)) arr = data.data

        if (!Array.isArray(arr)) arr = []
        let normalized = arr.map((s) => ({
          _id: (s as any)._id,
          subject_name: (s as any).subject_name || (s as any).Course_Name || "",
          subject_marks: Number((s as any).subject_marks ?? (s as any).marks ?? 0),
          classes_attended: Number((s as any).classes_attended ?? 0),
          classes_conducted: Number((s as any).classes_conducted ?? 0),
          attendance: Number((s as any).attendance ?? 0),
        }))
        // Fallback: if nothing found, try raw admin endpoint and filter by USN
        if (!normalized.length) {
          try {
            const rawRes = await fetch(`http://localhost:8080/admin/students?semester=${semester}&debug=raw`, { headers: { Authorization: token ? `Bearer ${token}` : "" } })
            if (rawRes.ok) {
              const rawJson = await rawRes.json()
              const rawArr: any[] = Array.isArray(rawJson) ? rawJson : []
              const filtered = rawArr.filter((doc) => (doc?.USN || doc?.usn || "").toString() === usn.toString())
              normalized = filtered.map((s) => ({
                _id: (s as any)._id,
                subject_name: (s as any).subject_name || (s as any).Course_Name || "",
                subject_marks: Number((s as any).subject_marks ?? (s as any).marks ?? 0),
                classes_attended: Number((s as any).classes_attended ?? 0),
                classes_conducted: Number((s as any).classes_conducted ?? 0),
                attendance: Number((s as any).attendance ?? 0),
              }))
            }
          } catch {
            // ignore fallback error, we'll show empty state
          }
        }
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

  const updateField = (index: number, field: keyof SubjectRecord, value: number) => {
    setSubjects((prev) => {
      const next = [...prev]
      const row = { ...next[index], [field]: value }
      // auto recalc attendance if attendance inputs changed
      if (field === "classes_attended" || field === "classes_conducted") {
        const attended = Number(row.classes_attended || 0)
        const conducted = Number(row.classes_conducted || 0)
        const pct = conducted > 0 ? Math.max(0, Math.min(100, (attended / conducted) * 100)) : 0
        row.attendance = Number(pct.toFixed(2))
      }
      next[index] = row
      return next
    })
  }

  const handleSave = async () => {
    if (!usn) return
    setLoading(true)
    setError(null)
    try {
      // Use provided USN as-is (do not alter casing) and do not send empty Authorization header
      const targetUsn = String(usn)
      const url = saveEndpoint(targetUsn, semester)
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch(url, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ subjects }),
      })

      // Read response text and try to parse JSON
      const respText = await res.text().catch(() => "")
      let parsed: any = null
      try { parsed = respText ? JSON.parse(respText) : null } catch { parsed = null }
      if (!res.ok) {
        const errMsg = parsed?.message || respText || `Save failed with ${res.status}`
        throw new Error(errMsg)
      }

      // Preferred: use server-returned updated subjects/docs to update UI instantly
      // Server may return updated docs in several shapes: { subjects: [...] } | { data: [...] } | { docs: [...] } | { student: { subjects: [...] } }
      let updatedSubjects: any[] | null = null
      if (Array.isArray(parsed?.subjects)) updatedSubjects = parsed.subjects
      else if (Array.isArray(parsed?.data)) {
        // data could be an array of students or subjects; try to find matching student
        const maybeStudent = parsed.data.find && parsed.data.find((d: any) => (d?.usn || d?.USN || "").toString().toUpperCase() === targetUsn)
        if (maybeStudent && Array.isArray(maybeStudent.subjects)) updatedSubjects = maybeStudent.subjects
        else updatedSubjects = parsed.data
      } else if (Array.isArray(parsed?.docs)) updatedSubjects = parsed.docs
      else if (parsed?.student && Array.isArray(parsed.student.subjects)) updatedSubjects = parsed.student.subjects

      if (updatedSubjects && Array.isArray(updatedSubjects)) {
        const normalized = updatedSubjects.map((s: any) => ({
          _id: s._id,
          subject_name: s.subject_name || s.Course_Name || "",
          subject_marks: Number(s.subject_marks ?? s.marks ?? 0),
          classes_attended: Number(s.classes_attended ?? 0),
          classes_conducted: Number(s.classes_conducted ?? 0),
          attendance: Number(s.attendance ?? 0),
        }))
        setSubjects(normalized)
      } else {
        // Fallback: re-fetch authoritative data with cache-bypass
        try {
          const freshRes = await fetch(fetchEndpoint(targetUsn, semester), { headers: token ? { Authorization: `Bearer ${token}` } : undefined, cache: "no-cache" } as any)
          if (freshRes.ok) {
            const fresh = await freshRes.json()
            let arr: any[] = []
            if (Array.isArray(fresh)) arr = fresh
            else if (Array.isArray(fresh?.subjects)) arr = fresh.subjects
            else if (Array.isArray(fresh?.students)) {
              const match = fresh.students.find((st: any) => (st?.usn || st?.USN || "").toString().toUpperCase() === targetUsn)
              if (match && Array.isArray(match.subjects)) arr = match.subjects
            } else if (Array.isArray(fresh?.data)) arr = fresh.data

            const normalized = arr.map((s: any) => ({
              _id: s._id,
              subject_name: s.subject_name || s.Course_Name || "",
              subject_marks: Number(s.subject_marks ?? s.marks ?? 0),
              classes_attended: Number(s.classes_attended ?? 0),
              classes_conducted: Number(s.classes_conducted ?? 0),
              attendance: Number(s.attendance ?? 0),
            }))
            setSubjects(normalized)
          }
        } catch {
          // ignore fallback errors
        }
      }

      onSaved?.()
      onOpenChange(false)
    } catch (e: any) {
      setError(e?.message || "Failed to save updates")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl w-full max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{usn ? `Edit Student ${usn} (Sem ${semester})` : "Edit Student"}</DialogTitle>
        </DialogHeader>
        <div className="mt-2 grid gap-4 overflow-hidden">
          {error && <div className="text-red-600 text-sm -mt-2 break-words">{error}</div>}
          <div className="overflow-auto -mx-1 px-1" style={{ maxHeight: "55vh" }}>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : subjects.length === 0 ? (
              <div className="text-sm text-muted-foreground">No subjects found for this student / semester.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Attended</TableHead>
                    <TableHead>Conducted</TableHead>
                    <TableHead className="text-right">Attendance %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((s, idx) => (
                    <TableRow key={`${s._id || s.subject_name}-${idx}`}>
                      <TableCell className="font-medium max-w-[260px] truncate">{s.subject_name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={String(Number(s.subject_marks ?? 0) || 0)}
                          onChange={(e) => updateField(idx, "subject_marks", Number(e.target.value) || 0)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={String(Number(s.classes_attended ?? 0) || 0)}
                          onChange={(e) => updateField(idx, "classes_attended", Number(e.target.value) || 0)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={String(Number(s.classes_conducted ?? 0) || 0)}
                          onChange={(e) => updateField(idx, "classes_conducted", Number(e.target.value) || 0)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell className="text-right">{Number(s.attendance ?? 0).toFixed(2)}%</TableCell>
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
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={loading}>Save Changes</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
