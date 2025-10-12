"use client";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"


export default function Page() {
  const [studentInfo, setStudentInfo] = useState({
    name: "",
    usn: "",
    department: "",
    academicYear: "",
  });

  useEffect(() => {
    const fetchStudentInfo = async () => {
      const token = localStorage.getItem("token");
      const usn = localStorage.getItem("usn");
      if (!token || !usn) return;
      try {
        const res = await fetch(`http://localhost:8080/users/getinfo/${usn}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetch status:", res.status);
        let data = null;
        try {
          data = await res.json();
        } catch (err) {
          console.error("Error parsing JSON:", err);
        }
        console.log("Student info raw response:", data);
        if (res.ok && data) {
          setStudentInfo({
            name: data.Name,
            usn: data.USN,
            department: data.Department,
            academicYear: data.AcademicYear,
          });
        }
      } catch (e) {
        // handle error
      }
    };
    fetchStudentInfo();
  }, []);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards
                name={studentInfo.name}
                usn={studentInfo.usn}
                department={studentInfo.department}
                academicYear={studentInfo.academicYear}
              />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive
                  name={studentInfo.name}
                  usn={studentInfo.usn}
                  department={studentInfo.department}
                  academicYear={studentInfo.academicYear}
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
                    department={studentInfo.department}
                    academicYear={studentInfo.academicYear}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
