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

interface PerformanceRecord {
  subjectName?: string;
  IA1?: number;
  IA2?: number;
  IA3?: number;
  assignment_marks?: number;
  SEE_marks?: number;
  totalMarks?: number;
  grade?: string;
}

interface SemesterPerformance {
  semester: number;
  records: PerformanceRecord[];
}

// Auto-calculate grade based on marks
function calculateGrade(marks: number): string {
  if (marks >= 90) return "O";
  if (marks >= 80) return "A+";
  if (marks >= 70) return "A";
  if (marks >= 60) return "B+";
  if (marks >= 50) return "B";
  if (marks >= 40) return "C";
  return "F";
}

export default function PerformancePage() {
  const [usn, setUsn] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  const availableSemesters = [1, 2, 3, 4, 5, 6, 7, 8];
  const [selectedSemester, setSelectedSemester] = useState<number | "all">(8);
  const [data, setData] = useState<SemesterPerformance[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    try {
      const u = localStorage.getItem("usn") || localStorage.getItem("USN") || "";
      const t = localStorage.getItem("token") || localStorage.getItem("jwt");
      setUsn(u);
      setToken(t);
    } catch {}
  }, []);

  // Use the same route from the main dashboard: http://localhost:8080/users/getsemesterdata/:usn?semester=
  async function fetchSemesterPerformance(semester: number): Promise<SemesterPerformance> {
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

    const records: PerformanceRecord[] = rawArray.map((s: any) => {
      const ia1 = Number(s?.IA1 ?? s?.ia1 ?? 0) || 0;
      const ia2 = Number(s?.IA2 ?? s?.ia2 ?? 0) || 0;
      const ia3 = Number(s?.IA3 ?? s?.ia3 ?? 0) || 0;
      const assign = Number(s?.assignment_marks ?? 0) || 0;
      const see = Number(s?.SEE_marks ?? s?.see ?? 0) || 0;
      const iaAvg = (ia1 + ia2 + ia3) / 3;
      const total = Math.round(iaAvg + assign + see);
      const grade = String(s?.grade ?? s?.result ?? s?.letterGrade ?? "").toUpperCase();
      return {
        subjectName: s?.subject_name ?? s?.Course_Name ?? s?.name ?? s?.subjectName ?? s?.title ?? "",
        IA1: ia1 || undefined,
        IA2: ia2 || undefined,
        IA3: ia3 || undefined,
        assignment_marks: assign || undefined,
        SEE_marks: see || undefined,
        totalMarks: total,
        grade: grade || calculateGrade(total),
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
        const results = await Promise.all(availableSemesters.map(fetchSemesterPerformance));
        setData(results);
      } else {
        const one = await fetchSemesterPerformance(selected);
        setData([one]);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to fetch performance");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (usn) fetchAll(selectedSemester);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usn, token, selectedSemester]);

  const flatRecords = useMemo(() => {
    return data.flatMap((d) => d.records.map((r) => ({ 
      ...r, 
      semester: d.semester,
      grade: calculateGrade(r.totalMarks ?? 0)
    })));
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
                <h1 className="text-xl font-semibold">Previous Performance</h1>
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
                    <CardTitle>Loading performance…</CardTitle>
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
                <Card className="!bg-sky-100 border border-sky-300">
                  <CardHeader>
                    <CardTitle>
                      {selectedSemester === "all" ? "Performance Across Semesters" : `Semester ${selectedSemester} Performance`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Semester</TableHead>
                          <TableHead>Subject Name</TableHead>
                          <TableHead className="text-center">IA1</TableHead>
                          <TableHead className="text-center">IA2</TableHead>
                          <TableHead className="text-center">IA3</TableHead>
                          <TableHead className="text-center">Assign</TableHead>
                          <TableHead className="text-center">SEE</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-right">Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {flatRecords.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center text-muted-foreground">
                              No performance records found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          flatRecords.map((r, idx) => (
                            <TableRow key={`${r.subjectName}-${idx}`}>
                              <TableCell>{String(r.semester ?? "")}</TableCell>
                              <TableCell>{r.subjectName ?? ""}</TableCell>
                              <TableCell className="text-center">{r.IA1 ?? "-"}</TableCell>
                              <TableCell className="text-center">{r.IA2 ?? "-"}</TableCell>
                              <TableCell className="text-center">{r.IA3 ?? "-"}</TableCell>
                              <TableCell className="text-center">{r.assignment_marks ?? "-"}</TableCell>
                              <TableCell className="text-center">{r.SEE_marks ?? "-"}</TableCell>
                              <TableCell className="text-right">{isNaN(r.totalMarks as number) ? "0" : String(r.totalMarks ?? 0)}</TableCell>
                              <TableCell className="text-right">
                                <span className={`font-medium ${
                                  r.grade === "F" ? "text-red-600" : 
                                  r.grade === "O" ? "text-green-600" : ""
                                }`}>
                                  {r.grade ?? "-"}
                                </span>
                              </TableCell>
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
