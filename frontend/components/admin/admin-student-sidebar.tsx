"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface AdminStudentSidebarProps extends React.ComponentProps<typeof Sidebar> {
  studentName?: string
  usn: string
  semester: string
  currentPage?: "dashboard" | "attendance" | "performance" | "personal"
}

export function AdminStudentSidebar({ 
  studentName, 
  usn, 
  semester, 
  currentPage = "dashboard",
  ...props 
}: AdminStudentSidebarProps) {
  const router = useRouter()

  const navItems = [
    { 
      title: "Dashboard", 
      page: "dashboard" as const,
      url: `/admin/student/dashboard?usn=${usn}&semester=${semester}`
    },
    { 
      title: "Personal Details", 
      page: "personal" as const,
      url: `/admin/student/personal?usn=${usn}&semester=${semester}`
    },
    { 
      title: "Attendance", 
      page: "attendance" as const,
      url: `/admin/student/attendance?usn=${usn}&semester=${semester}`
    },
    { 
      title: "Performance", 
      page: "performance" as const,
      url: `/admin/student/performance?usn=${usn}&semester=${semester}`
    },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="px-2 py-3">
              <h1 className="text-lg font-bold text-sidebar-foreground uppercase">
                Global Academy of Technology
              </h1>
              <p className="text-xs text-muted-foreground mt-1">Admin View</p>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Back to Admin button */}
        <div className="px-3 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin")}
            className="w-full gap-2 justify-start"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Button>
        </div>

        {/* Student info */}
        {studentName && (
          <div className="px-3 mb-4">
            <div className="rounded-md bg-sidebar-accent p-3">
              <p className="text-sm font-medium text-sidebar-accent-foreground">{studentName}</p>
              <p className="text-xs text-muted-foreground">{usn.toUpperCase()}</p>
            </div>
          </div>
        )}

        {/* Navigation items */}
        <div className="px-3">
          <div className="grid gap-2">
            {navItems.map((item) => (
              <a key={item.page} href={item.url} className="block w-full">
                <button 
                  className={`w-full rounded-md px-3 py-2 text-sm text-left transition-colors ${
                    currentPage === item.page
                      ? "bg-primary text-primary-foreground"
                      : "bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-accent-foreground"
                  }`}
                >
                  {item.title}
                </button>
              </a>
            ))}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
