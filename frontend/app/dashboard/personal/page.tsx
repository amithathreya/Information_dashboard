"use client";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";

export default function PersonalPage() {
  const [personalDetails, setPersonalDetails] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPersonal = async () => {
      const usn = (localStorage.getItem("usn") || "").toString();
      const token = localStorage.getItem("token") || localStorage.getItem("jwt") || "";
      if (!usn) {
        setError("USN not found. Please login first.");
        setPersonalDetails(null);
        return;
      }
      try {
        const headers: Record<string, string> = { Accept: "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`http://localhost:8080/users/personal/${encodeURIComponent(usn)}`, {
          headers,
          cache: "no-store",
        });
        if (!res.ok) {
          setError(res.status === 401 ? "Unauthorized. Please login or set a valid token." : `Cannot load personal details (${res.status})`);
          setPersonalDetails(null);
          return;
        }
        const json = await res.json();
        // Try to get name from localStorage as fallback (saved by main dashboard)
        const storedName = localStorage.getItem("name") || localStorage.getItem("studentName") || localStorage.getItem("fullName") || "";
        const normalized = {
          USN: json.USN || json.usn || usn,
          name: json.Name || json.name || json.FullName || json.fullName || json.student_name || json.StudentName || storedName || "-",
          branch: json.branch || json.department || json.Branch || json.Department || "-",
          email: json.email || json.Email || "-",
          phone: json.phone || json.phone_number || json.Phone || "-",
          address: json.address || json.Address || "-",
          mentor: json.mentor || json.mentor_name || json.Mentor || "-",
          age: json.age ?? json.Age ?? "-",
        };
        setError(null);
        setPersonalDetails(normalized);
      } catch (e) {
        setError("Error fetching personal details.");
        setPersonalDetails(null);
      }
    };
    fetchPersonal();
  }, []);

  return (
    <ThemeProvider attribute="class" forcedTheme="light" enableSystem={false}>
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 56)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties}
      >
        <AppSidebar variant="inset" showUser={false} />
        <SidebarInset>
          <SiteHeader />
          <div className="p-6 md:p-8 max-w-4xl">
            {error ? (
              <div className="text-red-600 bg-red-50 px-4 py-3 rounded-md">{error}</div>
            ) : personalDetails ? (
              <div className="space-y-1">
                <div className="flex py-3 border-b border-gray-100">
                  <span className="w-32 text-gray-500 text-sm">USN</span>
                  <span className="flex-1 text-gray-900">{personalDetails.USN}</span>
                </div>
                <div className="flex py-3 border-b border-gray-100">
                  <span className="w-32 text-gray-500 text-sm">Branch</span>
                  <span className="flex-1 text-gray-900">{personalDetails.branch !== "-" ? personalDetails.branch : "Computer Science and Engineering"}</span>
                </div>
                <div className="flex py-3 border-b border-gray-100">
                  <span className="w-32 text-gray-500 text-sm">Email</span>
                  <span className="flex-1 text-gray-900">{personalDetails.email !== "-" ? personalDetails.email : "Not Available"}</span>
                </div>
                <div className="flex py-3 border-b border-gray-100">
                  <span className="w-32 text-gray-500 text-sm">Phone</span>
                  <span className="flex-1 text-gray-900">{personalDetails.phone}</span>
                </div>
                <div className="flex py-3 border-b border-gray-100">
                  <span className="w-32 text-gray-500 text-sm">Age</span>
                  <span className="flex-1 text-gray-900">{personalDetails.age}</span>
                </div>
                <div className="flex py-3 border-b border-gray-100">
                  <span className="w-32 text-gray-500 text-sm">Address</span>
                  <span className="flex-1 text-gray-900">{personalDetails.address}</span>
                </div>
                <div className="flex py-3">
                  <span className="w-32 text-gray-500 text-sm">Mentor</span>
                  <span className="flex-1 text-gray-900">{personalDetails.mentor}</span>
                </div>
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
