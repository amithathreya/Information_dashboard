"use client";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/components/theme-provider"



export default function Page() {
  const [studentInfo, setStudentInfo] = useState({
    name: "",
    usn: "",
    department: "",
    academicYear: "",
  });
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [academicData, setAcademicData] = useState<any>(null);
  const [gradesData, setGradesData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string>("");
  const [semester, setSemester] = useState<string>("8");

  // Load stored semester on client after mount to avoid SSR/CSR mismatch.
  useEffect(() => {
    try {
      const s = localStorage.getItem("semester");
      if (s) setSemester(s);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    // Single consolidated fetch to retrieve semester data and student info in one request.
    const fetchAll = async (sem: string) => {
      const usn = localStorage.getItem("usn");
      const token = localStorage.getItem("token") || localStorage.getItem("jwt");
      if (!usn) {
        setFetchError("No USN found in localStorage. Please login first.");
        return;
      }
      if (!token) {
        setFetchError("No token provided. Please login or paste a token below.");
        return;
      }
      setLoading(true);
      setFetchError(null);
      try {
        const res = await fetch(`http://localhost:8080/users/getsemesterdata/${usn}?semester=${sem}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        // Map student info
        const info = data?.studentInfo ?? data?.user ?? data?.userInfo ?? data;
        if (info) {
          setStudentInfo({
            name: info.Name || info.name || info.FullName || "",
            usn: info.USN || info.usn || usn,
            department: info.Department || info.department || "",
            academicYear: info.AcademicYear || info.academicYear || "",
          });
        }

        // The backend now forwards plain semester documents as a single JSON array.
        const rawArray =
          (Array.isArray(data) && data) ||
          (Array.isArray(data?.grades) && data.grades) ||
          (Array.isArray(data?.subjects) && data.subjects) ||
          [];

        const subjects = rawArray;
        setGradesData(subjects);

        // Derive attendanceData for the chart from subjects
        const attendanceMapped = subjects.map((s: any) => ({
          Course_Name: s.subject_name || s.Course_Name || s.subject || "",
          AttendancePct:
            typeof s.attendance === "number"
              ? s.attendance
              : typeof s.AttendancePct === "number"
              ? s.AttendancePct
              : Number(s.attendancePercent) || 0,
        }));
        setAttendanceData(attendanceMapped);

        // Compute a simple semester GPA (avg marks / 10)
        const totalMarks = subjects.reduce((acc: number, cur: any) => acc + (Number(cur.subject_marks) || 0), 0);
        const avgMarks = subjects.length ? totalMarks / subjects.length : 0;
        const computedGPA = Math.round((avgMarks / 10) * 100) / 100; // two decimals
        const academicSummary = {
          PreviousSemesterGPA: computedGPA || "-",
          CumulativeGPA: computedGPA || "-",
        };
        setAcademicData(academicSummary);

        // If student info wasn't provided separately, try to extract from first subject document
        if (!data?.studentInfo && subjects.length) {
          const first = subjects[0];
          setStudentInfo((prev) => ({
            name: first.name || first.Name || prev.name,
            usn: first.USN || first.usn || prev.usn,
            department: prev.department,
            academicYear: prev.academicYear,
          }));
        }
      } catch (e) {
        // On error, clear data
        setStudentInfo({ name: "", usn: "", department: "", academicYear: "" });
        setAttendanceData([]);
        setAcademicData(null);
        setGradesData([]);
      } finally {
        setLoading(false);
      }
    };

    // initial fetch with current semester
    fetchAll(semester);

    // listen for semester changes and re-fetch
    const handler = (e: any) => {
      const s = e?.detail?.semester;
      if (s) {
        setSemester(s);
        fetchAll(s);
      }
    };
    window.addEventListener("semester-changed", handler as EventListener);
    return () => window.removeEventListener("semester-changed", handler as EventListener);
  }, [semester]);
  return (
    <ThemeProvider attribute="class" forcedTheme="light" enableSystem={false}>
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
  <AppSidebar variant="inset" studentName={studentInfo.name} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards
                name={studentInfo.name}
                usn={studentInfo.usn}
                department={studentInfo.department || "Computer Science and Engineering"}
                academicYear={studentInfo.academicYear}
                semester={semester}
                academicData={academicData}
              />
              {fetchError ? (
                <Card className="m-4 border-red-400">
                  <CardHeader>
                    <CardTitle className="text-red-600">Cannot load data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 text-sm text-red-500 break-words">{fetchError}</div>
                    <div className="flex gap-2">
                      <input
                        value={devToken}
                        onChange={(e) => setDevToken(e.target.value)}
                        placeholder="Paste token here (dev)"
                        className="flex-1 rounded-md border px-2 py-1 text-sm text-black"
                      />
                      <button
                        className="rounded bg-green-600 px-3 py-1 text-white text-sm"
                        onClick={() => {
                          if (!devToken) return;
                          localStorage.setItem("token", devToken);
                          // reload to trigger fetch with token
                          window.location.reload();
                        }}
                      >
                        Set token
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive
                  name={studentInfo.name}
                  usn={studentInfo.usn}
                  department={studentInfo.department || "Computer Science and Engineering"}
                  academicYear={studentInfo.academicYear}
                  attendanceData={attendanceData}
                />
              </div>
              <Card className="m-4">
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
      </SidebarInset>
    </SidebarProvider>
    </ThemeProvider>
  );
}
