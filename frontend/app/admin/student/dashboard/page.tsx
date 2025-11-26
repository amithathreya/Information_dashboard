"use client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { AdminStudentSidebar } from "@/components/admin/admin-student-sidebar"

export default function AdminStudentDashboardPage() {
  const searchParams = useSearchParams()
  const usn = searchParams.get("usn") || ""
  const semester = searchParams.get("semester") || "8"

  const [studentInfo, setStudentInfo] = useState({
    name: "",
    usn: usn,
    department: "",
    academicYear: "",
  })
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [academicData, setAcademicData] = useState<any>(null)
  const [gradesData, setGradesData] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!usn) {
        setFetchError("No USN provided.")
        setLoading(false)
        return
      }

      // Use admin token for fetching
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("jwt")
      
      setLoading(true)
      setFetchError(null)
      
      try {
        const res = await fetch(
          `http://localhost:8080/users/getsemesterdata/${usn}?semester=${semester}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        )
        
        if (!res.ok) {
          throw new Error(`Failed to fetch data: ${res.status}`)
        }
        
        const data = await res.json()

        // Map student info
        const info = data?.studentInfo ?? data?.user ?? data?.userInfo ?? data
        if (info) {
          setStudentInfo({
            name: info.Name || info.name || info.FullName || "",
            usn: info.USN || info.usn || usn,
            department: info.Department || info.department || "",
            academicYear: info.AcademicYear || info.academicYear || "",
          })
        }

        // Get subjects array
        const rawArray =
          (Array.isArray(data) && data) ||
          (Array.isArray(data?.grades) && data.grades) ||
          (Array.isArray(data?.subjects) && data.subjects) ||
          []

        const subjects = rawArray
        setGradesData(subjects)

        // Derive attendanceData for the chart
        const attendanceMapped = subjects.map((s: any) => ({
          Course_Name: s.subject_name || s.Course_Name || s.subject || "",
          AttendancePct:
            typeof s.attendance === "number"
              ? s.attendance
              : typeof s.AttendancePct === "number"
              ? s.AttendancePct
              : Number(s.attendancePercent) || 0,
        }))
        setAttendanceData(attendanceMapped)

        // Compute semester GPA
        const totalMarks = subjects.reduce(
          (acc: number, cur: any) => acc + (Number(cur.subject_marks) || 0),
          0
        )
        const avgMarks = subjects.length ? totalMarks / subjects.length : 0
        const computedGPA = Math.round((avgMarks / 10) * 100) / 100
        setAcademicData({
          PreviousSemesterGPA: computedGPA || "-",
          CumulativeGPA: computedGPA || "-",
        })

        // Extract name from first subject if not in studentInfo
        if (!data?.studentInfo && subjects.length) {
          const first = subjects[0]
          setStudentInfo((prev) => ({
            name: first.name || first.Name || prev.name,
            usn: first.USN || first.usn || prev.usn,
            department: prev.department,
            academicYear: prev.academicYear,
          }))
        }
      } catch (e: any) {
        setFetchError(e?.message || "Failed to load student data")
        setStudentInfo({ name: "", usn: usn, department: "", academicYear: "" })
        setAttendanceData([])
        setAcademicData(null)
        setGradesData([])
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [usn, semester])

  return (
    <ThemeProvider attribute="class" forcedTheme="light" enableSystem={false}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 56)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AdminStudentSidebar 
          variant="inset" 
          studentName={studentInfo.name} 
          usn={usn} 
          semester={semester}
          currentPage="dashboard"
        />
        <SidebarInset>
          <SiteHeader title="Admin - Student Dashboard" />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {loading ? (
                  <div className="px-4 lg:px-6 text-muted-foreground">
                    Loading student data...
                  </div>
                ) : fetchError ? (
                  <Card className="ml-4 mr-0 border-red-400 max-w-[50%]">
                    <CardHeader>
                      <CardTitle className="text-red-600">Cannot load data</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-red-500">{fetchError}</div>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <SectionCards
                      name={studentInfo.name}
                      usn={studentInfo.usn}
                      department={studentInfo.department || "Computer Science and Engineering"}
                      academicYear={studentInfo.academicYear}
                      semester={semester}
                      academicData={academicData}
                    />
                    <div className="pl-4 pr-0 lg:pl-6 lg:pr-0 w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="w-full">
                          <ChartAreaInteractive
                            name={studentInfo.name}
                            usn={studentInfo.usn}
                            department={studentInfo.department || "Computer Science and Engineering"}
                            academicYear={studentInfo.academicYear}
                            attendanceData={attendanceData}
                          />
                        </div>
                        <div className="w-full">
                          <Card className="w-full !bg-sky-100 border border-sky-300">
                            <CardHeader>
                              <CardTitle>Registered Courses</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <DataTable
                                name={studentInfo.name}
                                usn={studentInfo.usn}
                                department={studentInfo.department || "Computer Science and Engineering"}
                                academicYear={studentInfo.academicYear}
                                gradesData={gradesData}
                              />
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  )
}
