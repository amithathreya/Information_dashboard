"use client"
import { useEffect, useMemo, useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet"
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
// Assumed bulk update endpoint. Adjust to match backend.
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
      const res = await fetch(saveEndpoint(usn, semester), {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
        body: JSON.stringify({ subjects }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Save failed with ${res.status}`)
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{usn ? `Edit Student ${usn} (Sem ${semester})` : "Edit Student"}</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          {error && <div className="text-red-600 text-sm mb-2 break-words">{error}</div>}
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : subjects.length === 0 ? (
            <div className="text-sm text-muted-foreground">No subjects found for this student / semester.</div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Attended</TableHead>
                    <TableHead>Conducted</TableHead>
                    <TableHead>Attendance %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((s, idx) => (
                    <TableRow key={`${s._id || s.subject_name}-${idx}`}>
                      <TableCell className="font-medium max-w-[240px] truncate">{s.subject_name}</TableCell>
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
            </div>
          )}
        </div>
        <SheetFooter>
          <div className="flex w-full justify-end gap-2">
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button onClick={handleSave} disabled={loading}>Save Changes</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
