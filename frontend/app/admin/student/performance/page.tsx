"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminStudentSidebar } from "@/components/admin/admin-student-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Save, X, Loader2, Download } from "lucide-react";

// Store complete subject data to avoid losing fields on save
interface FullSubjectRecord {
  _id?: string;
  subject_name: string;
  IA1: number;
  IA2: number;
  IA3: number;
  assignment_marks: number;
  SEE_marks: number;
  subject_marks: number;
  grade: string;
  classes_attended: number;
  classes_conducted: number;
  attendance: number;
}

interface PerformanceRecord {
  subjectName: string;
  IA1: number;
  IA2: number;
  IA3: number;
  assignment_marks: number;
  SEE_marks: number;
  totalMarks: number;
  grade: string;
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

export default function AdminPerformancePage() {
  const searchParams = useSearchParams();
  const usn = searchParams.get("usn") || "";
  const semesterParam = searchParams.get("semester") || "8";
  
  const [studentName, setStudentName] = useState<string>("");
  const availableSemesters = [1, 2, 3, 4, 5, 6, 7, 8];
  const [selectedSemester, setSelectedSemester] = useState<number>(Number(semesterParam) || 8);
  
  // Store the complete raw subject data from API
  const [rawSubjects, setRawSubjects] = useState<FullSubjectRecord[]>([]);
  const [editedSubjects, setEditedSubjects] = useState<FullSubjectRecord[]>([]);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const token = typeof window !== "undefined" 
    ? (localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("jwt"))
    : null;

  // Fetch student name from admin endpoint
  async function fetchStudentName() {
    if (!usn) return;
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`http://localhost:8080/admin/students?semester=${selectedSemester}`, { headers });
      if (!res.ok) return;
      const json = await res.json();
      const students = Array.isArray(json) ? json : (json?.students || []);
      const student = students.find((st: any) => 
        (st.usn || st.USN || "").toLowerCase() === usn.toLowerCase()
      );
      if (student) {
        setStudentName(student.name || student.Name || "");
      }
    } catch (e) {
      // Ignore errors for student name fetch
    }
  }

  async function fetchData() {
    if (!usn) return;
    setLoading(true);
    setError("");
    
    try {
      const headers: Record<string, string> = {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      // Add timestamp to bust cache
      const url = `http://localhost:8080/users/getsemesterdata/${encodeURIComponent(usn)}?semester=${selectedSemester}&_t=${Date.now()}`;
      const res = await fetch(url, { headers, cache: "no-store" });
      
      if (!res.ok) {
        const msg = res.status === 401 ? "Unauthorized (401)" : res.status === 403 ? "Forbidden (403)" : `Error ${res.status}`;
        throw new Error(`${msg} while fetching semester ${selectedSemester}`);
      }
      
      const json = await res.json();

      const info = json?.studentInfo ?? json?.user ?? json?.userInfo ?? json;
      if (info && (info.Name || info.name)) {
        setStudentName(info.Name || info.name || "");
      }

      const rawArray =
        (Array.isArray(json) && json) ||
        (Array.isArray(json?.grades) && json.grades) ||
        (Array.isArray(json?.subjects) && json.subjects) ||
        [];

      // Debug: log raw data from API
      console.log("Raw API data:", JSON.stringify(rawArray, null, 2));

      // Store COMPLETE subject data including attendance fields
      const fullRecords: FullSubjectRecord[] = rawArray.map((s: any) => {
        const ia1 = Number(s?.IA1 ?? s?.ia1 ?? 0) || 0;
        const ia2 = Number(s?.IA2 ?? s?.ia2 ?? 0) || 0;
        const ia3 = Number(s?.IA3 ?? s?.ia3 ?? 0) || 0;
        const assign = Number(s?.assignment_marks ?? 0) || 0;
        const see = Number(s?.SEE_marks ?? s?.see ?? 0) || 0;
        const iaAvg = (ia1 + ia2 + ia3) / 3;
        const total = Math.round(iaAvg + assign + see);
        return {
          _id: s?._id,
          subject_name: String(s?.subject_name ?? s?.Course_Name ?? s?.name ?? ""),
          IA1: ia1,
          IA2: ia2,
          IA3: ia3,
          assignment_marks: assign,
          SEE_marks: see,
          subject_marks: total,
          grade: String(s?.grade ?? s?.result ?? "").toUpperCase() || calculateGrade(total),
          classes_attended: Number(s?.classes_attended ?? 0) || 0,
          classes_conducted: Number(s?.classes_conducted ?? 0) || 0,
          attendance: Number(s?.attendance ?? 0) || 0,
        };
      });
      
      // Debug: log processed data
      console.log("Processed records:", JSON.stringify(fullRecords, null, 2));
      
      // Deduplicate by subject_name - keep first occurrence of each subject
      const seen = new Set<string>();
      const uniqueRecords = fullRecords.filter((record) => {
        if (seen.has(record.subject_name)) {
          console.log(`Skipping duplicate subject: ${record.subject_name}`);
          return false;
        }
        seen.add(record.subject_name);
        return true;
      });
      
      console.log("Unique records after deduplication:", JSON.stringify(uniqueRecords, null, 2));
      
      setRawSubjects(uniqueRecords);
      setEditedSubjects(uniqueRecords);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch performance");
      setRawSubjects([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (usn) {
      fetchStudentName();
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usn, token, selectedSemester]);

  // Display records derived from raw/edited subjects with auto-calculated grade
  const displayRecords: PerformanceRecord[] = useMemo(() => {
    const source = isEditing ? editedSubjects : rawSubjects;
    return source.map((s) => {
      const iaAvg = (s.IA1 + s.IA2 + s.IA3) / 3;
      const total = Math.round(iaAvg + s.assignment_marks + s.SEE_marks);
      return {
        subjectName: s.subject_name,
        IA1: s.IA1,
        IA2: s.IA2,
        IA3: s.IA3,
        assignment_marks: s.assignment_marks,
        SEE_marks: s.SEE_marks,
        totalMarks: total,
        grade: calculateGrade(total),
      };
    });
  }, [rawSubjects, editedSubjects, isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setSaveSuccess(false);
    setEditedSubjects([...rawSubjects]);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedSubjects(rawSubjects);
  };

  const handleInputChange = (index: number, field: "IA1" | "IA2" | "IA3" | "assignment_marks" | "SEE_marks", value: string) => {
    const newData = [...editedSubjects];
    const numValue = parseInt(value) || 0;
    newData[index] = { 
      ...newData[index], 
      [field]: numValue,
    };
    // Auto-calculate total: (IA1+IA2+IA3)/3 + assignment_marks + SEE_marks
    const iaAvg = (newData[index].IA1 + newData[index].IA2 + newData[index].IA3) / 3;
    const totalMarks = Math.round(iaAvg + newData[index].assignment_marks + newData[index].SEE_marks);
    newData[index].subject_marks = totalMarks;
    newData[index].grade = calculateGrade(totalMarks);
    setEditedSubjects(newData);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setError("");
    
    try {
      // Update each subject individually using document _id for precise updates
      // PATCH /admin/collection/semester_<n>/<_id>
      const updatePromises = editedSubjects.map(async (record) => {
        const body = {
          subject_name: record.subject_name,
          IA1: record.IA1,
          IA2: record.IA2,
          IA3: record.IA3,
          assignment_marks: record.assignment_marks,
          SEE_marks: record.SEE_marks,
          subject_marks: record.subject_marks,
          grade: record.grade,
          classes_attended: record.classes_attended,
          classes_conducted: record.classes_conducted,
          attendance: record.attendance,
        };
        
        // Use _id for precise document update
        const documentId = record._id;
        console.log(`Updating ${record.subject_name} (id: ${documentId}):`, body);
        
        const res = await fetch(
          `http://localhost:8080/admin/collection/semester_${selectedSemester}/${encodeURIComponent(documentId)}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify(body),
          }
        );
        
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Failed to save ${record.subject_name} (${res.status})`);
        }
        
        const responseData = await res.json().catch(() => ({}));
        console.log(`Save response for ${record.subject_name}:`, responseData);
        return responseData;
      });

      await Promise.all(updatePromises);
      
      setRawSubjects(editedSubjects);
      setIsEditing(false);
      setSaveSuccess(true);
      
      // Refresh data
      setTimeout(() => fetchData(), 500);
    } catch (e: any) {
      setError(e.message || "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

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
          studentName={studentName} 
          usn={usn} 
          semester={semesterParam}
          currentPage="performance"
        />
        <SidebarInset>
          <SiteHeader title="Admin - Performance" />
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Performance / Marks</h1>
                <div className="flex items-center gap-2">
                  {saveSuccess && (
                    <span className="text-sm text-green-600">Saved successfully!</span>
                  )}
                  <Select
                    value={String(selectedSemester)}
                    onValueChange={(v) => setSelectedSemester(Number(v))}
                    disabled={isEditing}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSemesters.map((s) => (
                        <SelectItem key={s} value={String(s)}>
                          Semester {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isEditing ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        className="gap-2 bg-green-600 hover:bg-green-700"
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={handleEdit}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  )}
                </div>
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
                    <CardTitle>Semester {selectedSemester} Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject Name</TableHead>
                          <TableHead className="text-center w-16">IA1</TableHead>
                          <TableHead className="text-center w-16">IA2</TableHead>
                          <TableHead className="text-center w-16">IA3</TableHead>
                          <TableHead className="text-center w-20">Assign</TableHead>
                          <TableHead className="text-center w-16">SEE</TableHead>
                          <TableHead className="text-center w-20">Total</TableHead>
                          <TableHead className="text-center w-20">Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayRecords.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center text-muted-foreground">
                              No performance records found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          displayRecords.map((r, idx) => (
                            <TableRow key={`${r.subjectName}-${idx}`}>
                              <TableCell>{r.subjectName ?? ""}</TableCell>
                              <TableCell className="text-center">
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    value={editedSubjects[idx]?.IA1 ?? 0}
                                    onChange={(e) => handleInputChange(idx, "IA1", e.target.value)}
                                    className="w-14 text-center"
                                    min={0}
                                    max={50}
                                  />
                                ) : (
                                  r.IA1 || "-"
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    value={editedSubjects[idx]?.IA2 ?? 0}
                                    onChange={(e) => handleInputChange(idx, "IA2", e.target.value)}
                                    className="w-14 text-center"
                                    min={0}
                                    max={50}
                                  />
                                ) : (
                                  r.IA2 || "-"
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    value={editedSubjects[idx]?.IA3 ?? 0}
                                    onChange={(e) => handleInputChange(idx, "IA3", e.target.value)}
                                    className="w-14 text-center"
                                    min={0}
                                    max={50}
                                  />
                                ) : (
                                  r.IA3 || "-"
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    value={editedSubjects[idx]?.assignment_marks ?? 0}
                                    onChange={(e) => handleInputChange(idx, "assignment_marks", e.target.value)}
                                    className="w-14 text-center"
                                    min={0}
                                    max={50}
                                  />
                                ) : (
                                  r.assignment_marks || "-"
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    value={editedSubjects[idx]?.SEE_marks ?? 0}
                                    onChange={(e) => handleInputChange(idx, "SEE_marks", e.target.value)}
                                    className="w-14 text-center"
                                    min={0}
                                    max={100}
                                  />
                                ) : (
                                  r.SEE_marks || "-"
                                )}
                              </TableCell>
                              <TableCell className="text-center font-medium">
                                {r.totalMarks ?? 0}
                              </TableCell>
                              <TableCell className="text-center">
                                <span className={`font-medium ${
                                  r.grade === "F" ? "text-red-600" : 
                                  r.grade === "O" ? "text-green-600" : ""
                                }`}>
                                  {r.grade || "-"}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                    
                    {/* Download Button */}
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          const studentInfo = `Student Name,${studentName || "N/A"}\nUSN,${usn.toUpperCase()}\nSemester,${selectedSemester}\n\n`;
                          const csvHeader = "Subject Name,IA1,IA2,IA3,Assignment,SEE,Total,Grade\n";
                          const csvRows = displayRecords.map(r => 
                            `"${r.subjectName}",${r.IA1 || 0},${r.IA2 || 0},${r.IA3 || 0},${r.assignment_marks || 0},${r.SEE_marks || 0},${r.totalMarks},"${r.grade}"`
                          ).join("\n");
                          const csvContent = studentInfo + csvHeader + csvRows;
                          const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = `${usn}_semester${selectedSemester}_performance.csv`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          URL.revokeObjectURL(url);
                        }}
                        disabled={displayRecords.length === 0}
                      >
                        <Download className="h-4 w-4" />
                        Download CSV
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
