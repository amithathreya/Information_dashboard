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
import { Pencil, Save, X, Loader2 } from "lucide-react";

// Store complete subject data to avoid losing fields on save
interface FullSubjectRecord {
  _id?: string;
  subject_name: string;
  subject_marks: number;
  grade: string;
  classes_attended: number;
  classes_conducted: number;
  attendance: number;
}

interface PerformanceRecord {
  subjectName: string;
  totalMarks: number;
  grade: string;
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

  async function fetchData() {
    if (!usn) return;
    setLoading(true);
    setError("");
    
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const url = `http://localhost:8080/users/getsemesterdata/${encodeURIComponent(usn)}?semester=${selectedSemester}`;
      const res = await fetch(url, { headers });
      
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

      // Store COMPLETE subject data including attendance fields
      const fullRecords: FullSubjectRecord[] = rawArray.map((s: any) => ({
        _id: s?._id,
        subject_name: s?.subject_name ?? s?.Course_Name ?? s?.name ?? "",
        subject_marks: Number(s?.subject_marks ?? s?.marks ?? 0) || 0,
        grade: String(s?.grade ?? s?.result ?? "").toUpperCase(),
        classes_attended: Number(s?.classes_attended ?? 0) || 0,
        classes_conducted: Number(s?.classes_conducted ?? 0) || 0,
        attendance: Number(s?.attendance ?? 0) || 0,
      }));
      
      setRawSubjects(fullRecords);
      setEditedSubjects(fullRecords);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch performance");
      setRawSubjects([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (usn) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usn, token, selectedSemester]);

  // Display records derived from raw/edited subjects
  const displayRecords: PerformanceRecord[] = useMemo(() => {
    const source = isEditing ? editedSubjects : rawSubjects;
    return source.map((s) => ({
      subjectName: s.subject_name,
      totalMarks: s.subject_marks,
      grade: s.grade,
    }));
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

  const handleInputChange = (index: number, field: "subject_marks" | "grade", value: string) => {
    const newData = [...editedSubjects];
    if (field === "subject_marks") {
      newData[index] = { ...newData[index], subject_marks: parseInt(value) || 0 };
    } else {
      newData[index] = { ...newData[index], grade: value.toUpperCase() };
    }
    setEditedSubjects(newData);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setError("");
    
    try {
      // Send COMPLETE subject data including attendance fields
      const subjects = editedSubjects.map((record) => ({
        subject_name: record.subject_name,
        subject_marks: record.subject_marks,
        grade: record.grade,
        classes_attended: record.classes_attended,
        classes_conducted: record.classes_conducted,
        attendance: record.attendance,
      }));

      const res = await fetch(
        `http://localhost:8080/admin/updateSemesterSubjects/${encodeURIComponent(usn)}?semester=${selectedSemester}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ subjects }),
        }
      );
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to save (${res.status})`);
      }
      
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
                          <TableHead className="text-right w-28">Marks</TableHead>
                          <TableHead className="text-right w-24">Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {displayRecords.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                              No performance records found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          displayRecords.map((r, idx) => (
                            <TableRow key={`${r.subjectName}-${idx}`}>
                              <TableCell>{r.subjectName ?? ""}</TableCell>
                              <TableCell className="text-right">
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    value={editedSubjects[idx]?.subject_marks ?? 0}
                                    onChange={(e) => handleInputChange(idx, "subject_marks", e.target.value)}
                                    className="w-20 text-right ml-auto"
                                    min={0}
                                    max={100}
                                  />
                                ) : (
                                  String(r.totalMarks ?? 0)
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {isEditing ? (
                                  <Input
                                    type="text"
                                    value={editedSubjects[idx]?.grade ?? ""}
                                    onChange={(e) => handleInputChange(idx, "grade", e.target.value)}
                                    className="w-16 text-center ml-auto uppercase"
                                    maxLength={2}
                                    placeholder="A+"
                                  />
                                ) : (
                                  r.grade || "-"
                                )}
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
