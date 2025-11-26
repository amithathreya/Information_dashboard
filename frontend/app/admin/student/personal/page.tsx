"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { AdminStudentSidebar } from "@/components/admin/admin-student-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Save, X, Loader2 } from "lucide-react";

interface PersonalDetails {
  USN: string;
  name: string;
  branch: string;
  email: string;
  phone: string;
  address: string;
  mentor: string;
  age: string | number;
}

export default function AdminPersonalPage() {
  const searchParams = useSearchParams();
  const usn = searchParams.get("usn") || "";
  const semesterParam = searchParams.get("semester") || "8";
  
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails | null>(null);
  const [editedDetails, setEditedDetails] = useState<PersonalDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchPersonal = async () => {
    if (!usn) {
      setError("USN not provided.");
      setPersonalDetails(null);
      return;
    }
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("jwt") || "";
    try {
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const res = await fetch(`http://localhost:8080/admin/students?semester=${semesterParam}`, {
        headers,
        cache: "no-store",
      });
      
      if (!res.ok) {
        setError(res.status === 401 ? "Unauthorized. Please login or set a valid token." : `Cannot load data (${res.status})`);
        setPersonalDetails(null);
        return;
      }
      
      const json = await res.json();
      
      let students: any[] = [];
      if (Array.isArray(json)) students = json;
      else if (Array.isArray(json?.students)) students = json.students;
      
      const student = students.find((st: any) => 
        (st.usn || st.USN || "").toLowerCase() === usn.toLowerCase()
      );
      
      if (!student) {
        setError("Student not found.");
        setPersonalDetails(null);
        return;
      }
      
      const personalRaw = student.personal || student.Personal || student.personal_info || student.personalInfo || {};
      
      const normalized: PersonalDetails = {
        USN: student.usn || student.USN || usn,
        name: student.name || student.Name || "",
        branch: student.department || student.Department || personalRaw.branch || "",
        email: personalRaw.email || personalRaw.Email || student.email || "",
        phone: personalRaw.phone_number || personalRaw.phone || student.phone || student.Phone || "",
        address: personalRaw.address || personalRaw.Address || "",
        mentor: personalRaw.mentor_name || personalRaw.mentor || "",
        age: personalRaw.age ?? personalRaw.Age ?? "",
      };
      
      setError(null);
      setPersonalDetails(normalized);
      setEditedDetails(normalized);
    } catch (e) {
      setError("Error fetching personal details.");
      setPersonalDetails(null);
    }
  };

  useEffect(() => {
    fetchPersonal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usn, semesterParam]);

  const handleEdit = () => {
    setIsEditing(true);
    setSaveSuccess(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedDetails(personalDetails);
  };

  const handleSave = async () => {
    if (!editedDetails) return;
    
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token") || localStorage.getItem("jwt") || "";
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      // Use the new PATCH endpoint for personal_information
      const res = await fetch(`http://localhost:8080/admin/personal/${encodeURIComponent(usn)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          name: editedDetails.name,
          branch: editedDetails.branch,
          email: editedDetails.email,
          phone_number: editedDetails.phone,
          address: editedDetails.address,
          mentor_name: editedDetails.mentor,
          age: editedDetails.age ? Number(editedDetails.age) : undefined,
        }),
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to save (${res.status})`);
      }
      
      setPersonalDetails(editedDetails);
      setIsEditing(false);
      setSaveSuccess(true);
      
      // Refresh data to get server state
      setTimeout(() => fetchPersonal(), 500);
    } catch (e: any) {
      setError(e.message || "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof PersonalDetails, value: string) => {
    if (!editedDetails) return;
    setEditedDetails({ ...editedDetails, [field]: value });
  };

  const renderField = (label: string, field: keyof PersonalDetails, placeholder?: string) => {
    const value = isEditing ? (editedDetails?.[field] ?? "") : (personalDetails?.[field] ?? "-");
    const displayValue = value === "" ? "-" : value;
    
    return (
      <div className="flex py-3 border-b border-gray-100 items-center">
        <span className="w-32 text-gray-500 text-sm">{label}</span>
        {isEditing && field !== "USN" ? (
          <Input
            value={String(editedDetails?.[field] ?? "")}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder || label}
            className="flex-1 max-w-md"
          />
        ) : (
          <span className="flex-1 text-gray-900">{String(displayValue)}</span>
        )}
      </div>
    );
  };

  return (
    <ThemeProvider attribute="class" forcedTheme="light" enableSystem={false}>
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 56)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AdminStudentSidebar 
          variant="inset" 
          studentName={personalDetails?.name || ""} 
          usn={usn} 
          semester={semesterParam}
          currentPage="personal"
        />
        <SidebarInset>
          <SiteHeader title="Admin - Personal Details" />
          <div className="p-6 md:p-8 max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-semibold">Personal Details</h1>
              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <span className="text-sm text-green-600">Saved successfully!</span>
                )}
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
                    Edit Details
                  </Button>
                )}
              </div>
            </div>
            {error ? (
              <div className="text-red-600 bg-red-50 px-4 py-3 rounded-md">{error}</div>
            ) : personalDetails ? (
              <div className="space-y-1">
                {renderField("Name", "name")}
                {renderField("USN", "USN")}
                {renderField("Branch", "branch", "e.g. Computer Science")}
                {renderField("Email", "email", "email@example.com")}
                {renderField("Phone", "phone", "Phone number")}
                {renderField("Age", "age", "Age")}
                {renderField("Address", "address", "Full address")}
                {renderField("Mentor", "mentor", "Mentor name")}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500 py-8">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </div>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
