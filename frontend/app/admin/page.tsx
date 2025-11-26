"use client"
import { useCallback, useEffect, useMemo, useState } from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { StudentCard, StudentSummary } from "@/components/admin/student-card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/*
  Admin Dashboard Page
  Assumptions:
  - Endpoint to list students for a semester: GET http://localhost:8080/admin/students?semester=<n>
    Returns: Array<{ name, usn, department, subjects: [{ subject_name, subject_marks, classes_attended, classes_conducted, attendance }] }>
  - Endpoint to update student subjects (bulk): PATCH http://localhost:8080/admin/updateSemesterSubjects/:usn?semester=<n>
    Body: { subjects: [...] }
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
  const [students, setStudents] = useState<StudentSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchMode, setSearchMode] = useState<"usn" | "name">("usn")
  const token = useMemo(() => (typeof window !== "undefined" ? (localStorage.getItem("token") || localStorage.getItem("jwt")) : null), [])
  const [highlightUSN, setHighlightUSN] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const PAGE_SIZE = 15

  const [meta, setMeta] = useState<{ totalGrouped?: number; page?: number; perPage?: number; semester?: string } | null>(null)

  const fetchStudents = useCallback(async (sem: string, page = 1) => {
    setLoading(true)
    setError(null)
    try {
      // Fetch entire semester data (no server-side pagination)
      const url = `http://localhost:8080/admin/students?semester=${sem}`
      const res = await fetch(url, {
        // Read is public in backend; if token exists we still send it.
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      })
      if (!res.ok) throw new Error(`Failed ${res.status}`)
      const json = await res.json()
      // Debug: expose raw response for inspection when needed (includes page)
      // eslint-disable-next-line no-console
      console.info(`/admin/students?semester=${sem}&page=${page} response:`, json)
      // Server may return either an array of students or an object { students: [...], meta: {...} }
      let data: RawStudent[] = []
      if (Array.isArray(json)) data = json
      else if (Array.isArray(json?.students)) data = json.students
      else data = []
      // Server no longer provides page meta when returning full list; force client-side behavior
      setMeta(null)
      const mapped: StudentSummary[] = data.map((st) => {
        const subs = Array.isArray((st as any).subjects) ? (st as any).subjects : []
        const marks = subs.map((s: any) => Number(s.subject_marks ?? s.marks ?? 0)).filter((n: number) => !isNaN(n))
        const avgMarks = marks.length ? marks.reduce((a: number, b: number) => a + b, 0) / marks.length : undefined
        const atts = subs.map((s: any) => Number(s.attendance ?? 0)).filter((n: number) => !isNaN(n))
        const avgAttendance = atts.length ? atts.reduce((a: number, b: number) => a + b, 0) / atts.length : undefined
        const personalRaw = (st as any).personal || (st as any).Personal || (st as any).personal_info || (st as any).personalInfo || (st as any).details || undefined
        const personal = personalRaw
          ? {
              _id: personalRaw._id || personalRaw.id || undefined,
              usn: personalRaw.usn || personalRaw.USN || personalRaw.usn?.toString() || undefined,
              age: personalRaw.age ?? personalRaw.Age ?? undefined,
              address: personalRaw.address || personalRaw.Address || personalRaw.addr || undefined,
              phone_number: personalRaw.phone_number || personalRaw.phone || personalRaw.mobile || personalRaw.Phone || undefined,
              mentor_name: personalRaw.mentor_name || personalRaw.mentor || personalRaw.mentorName || undefined,
            }
          : undefined

        return {
          name: (st as any).name || (st as any).Name || "",
          usn: (st as any).usn || (st as any).USN || "",
          department: (st as any).department || (st as any).Department || "CSE",
          phone: (st as any).phone || (st as any).Phone || (st as any).mobile || (st as any).Mobile || undefined,
          personal,
          totalSubjects: subs.length,
          avgMarks,
          avgAttendance,
          subjects: subs.map((s: any) => ({
            name: s.subject_name || s.name || "Subject",
            marks: Number(s.subject_marks ?? s.marks)
          })).filter((x: any) => !isNaN(x.marks)),
        }
      })
      // Log the first student's personal block to help debug rendering
      // eslint-disable-next-line no-console
      if (mapped.length) console.info('First student personal:', mapped[0].personal)
      setStudents(mapped)
    } catch (e: any) {
      setError(e?.message || "Failed to load students")
      setStudents([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchStudents(semester, currentPage)
  }, [semester, currentPage, fetchStudents])

  // Reset to first page whenever semester changes
  useEffect(() => {
    setCurrentPage(1)
  }, [semester])

  // Stats cards removed per request

  const goToStudentCard = (usn: string) => {
    setSearchOpen(false)
    // If the student is on a different page, switch to that page first
    const idx = students.findIndex((s) => s.usn === usn)
    if (idx >= 0) {
      const targetPage = Math.floor(idx / PAGE_SIZE) + 1
      setCurrentPage(targetPage)
      // Delay slightly to allow the new page items to render, then scroll
      setTimeout(() => {
        const el = document.getElementById(`student-${usn}`)
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" })
          setHighlightUSN(usn)
          // Remove highlight after a short time
          setTimeout(() => setHighlightUSN((curr) => (curr === usn ? null : curr)), 1600)
        }
      }, 120)
    } else {
      // Fallback: item not found in current student list — close search and do nothing
      setTimeout(() => setHighlightUSN(null), 0)
    }
  }

  return (
    <ThemeProvider attribute="class" forcedTheme="light" enableSystem={false}>
    <SidebarProvider>
      <SidebarInset>
        <SiteHeader showSidebarTrigger={false} title="Admin" />
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
            <Button variant="outline" onClick={() => setSearchOpen(true)}>
              Search Students
            </Button>
            {loading && <div className="text-sm text-muted-foreground">Loading students…</div>}
            {error && <div className="text-sm text-red-600">{error}</div>}
          </div>

          {/* Stats cards removed */}

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {
              // If server provides meta, render the returned page; otherwise paginate client-side from the full array
            }
            {(
              (() => {
                const perPage = meta?.perPage ?? PAGE_SIZE
                const total = meta?.totalGrouped ?? students.length
                const totalPages = Math.max(1, Math.ceil((total || 0) / perPage))
                // Use a local clamped page to avoid setting state during render
                const curPage = Math.min(Math.max(1, currentPage), totalPages)
                const start = (curPage - 1) * perPage
                const end = start + perPage
                const displayed = meta ? students : students.slice(start, end)
                return displayed.map((st) => (
                  <div
                    key={st.usn}
                    id={`student-${st.usn}`}
                    className={`rounded-xl transition ring-offset-2 ${highlightUSN === st.usn ? 'ring-2 ring-primary' : ''}`}
                  >
                    <StudentCard student={st} semester={semester} />
                  </div>
                ))
              })()
            )}
            {!loading && students.length === 0 && (
              <div className="text-sm text-muted-foreground col-span-full">No students found for semester {semester}.</div>
            )}
          </div>
          {/* Pagination controls (server-driven) */}
          <div className="pt-2">
              <Pagination aria-label="Student list pagination">
                <PaginationPrevious onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} aria-disabled={currentPage === 1} />
                <PaginationContent>
                  {Array.from({ length: Math.ceil(((meta?.totalGrouped ?? students.length) || 0) / (meta?.perPage || PAGE_SIZE)) }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink onClick={() => setCurrentPage(page)} isActive={page === currentPage}>
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                </PaginationContent>
                <PaginationNext onClick={() => setCurrentPage((p) => Math.min(Math.ceil(((meta?.totalGrouped ?? students.length) || 0) / (meta?.perPage || PAGE_SIZE)), p + 1))} aria-disabled={currentPage === Math.ceil(((meta?.totalGrouped ?? students.length) || 0) / (meta?.perPage || PAGE_SIZE))} />
              </Pagination>
            </div>
        </div>
      </SidebarInset>
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen} title="Search Students" description="Find by USN or Name" className="sm:max-w-xl">
        <CommandInput placeholder={searchMode === "usn" ? "Search by USN…" : "Search by name…"} />
        <div className="px-2 py-1.5">
          <div className="text-xs text-muted-foreground mb-1">Search mode</div>
          <ToggleGroup type="single" value={searchMode} onValueChange={(v) => v && setSearchMode(v as any)} variant="outline" size="sm">
            <ToggleGroupItem value="usn">USN</ToggleGroupItem>
            <ToggleGroupItem value="name">Name</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <CommandList>
          <CommandEmpty>No students found.</CommandEmpty>
          {searchMode === "usn" ? (
            <CommandGroup heading="By USN">
              {students.map((st) => (
                <CommandItem key={st.usn} onSelect={() => goToStudentCard(st.usn)}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono tabular-nums font-medium">{st.usn}</span>
                    <span className="text-muted-foreground truncate">{st.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : (
            <CommandGroup heading="By Name">
              {students.map((st) => (
                <CommandItem key={st.usn} onSelect={() => goToStudentCard(st.usn)}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium truncate">{st.name}</span>
                    <span className="text-muted-foreground font-mono tabular-nums">{st.usn}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </SidebarProvider>
    </ThemeProvider>
  )
}
