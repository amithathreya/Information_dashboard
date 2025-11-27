"use client";

import { useEffect, useMemo, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AttendanceRecord {
  subjectName?: string;
  attended?: number;
  total?: number;
  percentage?: number;
}

interface SemesterAttendance {
  semester: number;
  records: AttendanceRecord[];
}

export default function AttendancePage() {
  const [usn, setUsn] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  const availableSemesters = [1, 2, 3, 4, 5, 6, 7, 8];
  const [selectedSemester, setSelectedSemester] = useState<number | "all">(8);
  const [data, setData] = useState<SemesterAttendance[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // read usn/token from localStorage
  useEffect(() => {
    try {
      const u = localStorage.getItem("usn") || localStorage.getItem("USN") || "";
      const t = localStorage.getItem("token") || localStorage.getItem("jwt");
      setUsn(u);
      setToken(t);
    } catch {}
  }, []);

  // Use the same route from the main dashboard: http://localhost:8080/users/getsemesterdata/:usn?semester=
  async function fetchSemesterAttendance(semester: number): Promise<SemesterAttendance> {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const url = `http://localhost:8080/users/getsemesterdata/${encodeURIComponent(usn)}?semester=${semester}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      const msg = res.status === 401 ? "Unauthorized (401)" : res.status === 403 ? "Forbidden (403)" : `Error ${res.status}`;
      throw new Error(`${msg} while fetching semester ${semester}`);
    }
    const json = await res.json();

    // normalize subjects - same as main dashboard
    const rawArray =
      (Array.isArray(json) && json) ||
      (Array.isArray(json?.grades) && json.grades) ||
      (Array.isArray(json?.subjects) && json.subjects) ||
      [];

    const records: AttendanceRecord[] = rawArray.map((s: any) => {
      // Backend returns classes_attended and classes_conducted
      const attendedRaw = Number(s?.classes_attended ?? s?.attended ?? s?.classesAttended ?? 0);
      const totalRaw = Number(s?.classes_conducted ?? s?.total ?? s?.classesTotal ?? s?.held ?? 0);
      const attended = isNaN(attendedRaw) ? 0 : attendedRaw;
      const total = isNaN(totalRaw) ? 0 : totalRaw;
      // attendance field is the percentage
      const pctRaw = typeof s.attendance === "number"
        ? s.attendance
        : typeof s.AttendancePct === "number"
        ? s.AttendancePct
        : total > 0 ? Math.round((attended / total) * 100) : 0;
      const pct = isNaN(pctRaw) ? 0 : pctRaw;
      return {
        subjectName: s?.subject_name ?? s?.Course_Name ?? s?.name ?? s?.subjectName ?? s?.title ?? "",
        attended,
        total,
        percentage: pct,
      };
    });
    return { semester, records };
  }

  async function fetchAll(selected: number | "all") {
    if (!usn) return;
    setLoading(true);
    setError("");
    try {
      if (selected === "all") {
        const results = await Promise.all(availableSemesters.map(fetchSemesterAttendance));
        setData(results);
      } else {
        const one = await fetchSemesterAttendance(selected);
        setData([one]);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (usn) fetchAll(selectedSemester);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usn, token, selectedSemester]);

  const flatRecords = useMemo(() => {
    return data.flatMap((d) => d.records.map((r) => ({ ...r, semester: d.semester })));
  }, [data]);

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
        <AppSidebar variant="inset" showUser={false} />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Attendance</h1>
                <Select
                  value={String(selectedSemester)}
                  onValueChange={(v) => {
                    if (v === "all") setSelectedSemester("all");
                    else setSelectedSemester(Number(v));
                  }}
                >
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    {availableSemesters.map((s) => (
                      <SelectItem key={s} value={String(s)}>
                        Semester {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Separator />

              {loading && (
                <Card>
                  <CardHeader>
                    <CardTitle>Loading attendance…</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Fetching data from server.</p>
                  </CardContent>
                </Card>
              )}

              {!loading && error && (
                <Card className="border-rose-500/40">
                  <CardHeader>
                    <CardTitle>Error</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-rose-600">{error}</p>
                  </CardContent>
                </Card>
              )}

              {!loading && !error && (
                <Card className="!bg-amber-100 border border-amber-300">
                  <CardHeader>
                    <CardTitle>
                      {selectedSemester === "all" ? "Attendance Across Semesters" : `Semester ${selectedSemester} Attendance`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Semester</TableHead>
                          <TableHead>Subject Name</TableHead>
                          <TableHead className="text-right">Attended</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-right">%</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {flatRecords.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                              No attendance records found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          flatRecords.map((r, idx) => (
                            <TableRow key={`${r.subjectName}-${idx}`}>
                              <TableCell>{String(r.semester ?? "")}</TableCell>
                              <TableCell>{r.subjectName ?? ""}</TableCell>
                              <TableCell className="text-right">{isNaN(r.attended as number) ? "0" : String(r.attended ?? 0)}</TableCell>
                              <TableCell className="text-right">{isNaN(r.total as number) ? "0" : String(r.total ?? 0)}</TableCell>
                              <TableCell className="text-right">{isNaN(r.percentage as number) ? "0" : String(r.percentage ?? 0)}%</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
