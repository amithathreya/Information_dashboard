"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
} from "@tabler/icons-react"
import { HamburgerIcon } from "@/components/ui/hamburger-icon"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useState, useEffect } from "react"

const data = {
  user: {
    name: "Student",
    avatar: "/avatars/shadcn.jpg",
  },
    navMain: [
    {
      title: "Dashboard",
      url: "/dashboard  ",
    }
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    
  ]
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  studentName?: string
  showUser?: boolean
}

export function AppSidebar({ studentName, showUser = true, ...props }: AppSidebarProps) {
  // prefer the passed studentName if provided, otherwise fall back to the default in `data`
  const sidebarData = {
    ...data,
    user: {
      ...data.user,
      name: studentName ?? data.user.name,
    },
  }

  // Client-side user name from localStorage (avoids hardcoding)
  const [userName, setUserName] = useState<string>(studentName || "")
  
  // Effect to update from prop when it changes
  useEffect(() => {
    if (studentName && studentName.trim().length > 0) {
      setUserName(studentName)
    }
  }, [studentName])

  // Effect to read from localStorage on client mount and retry if empty
  useEffect(() => {
    const readFromStorage = () => {
      try {
        const n = localStorage.getItem("name") || localStorage.getItem("studentName") || localStorage.getItem("fullName")
        if (n && n.trim().length > 0) {
          setUserName(prev => {
            // Only update if current value is empty or a placeholder
            if (!prev || prev.trim().length === 0 || prev === "Student" || prev === "Guest") {
              return n
            }
            return prev
          })
          return true // found a name
        }
        return false
      } catch (e) {
        return false
      }
    }

    // Try immediately
    if (!readFromStorage()) {
      // If not found, retry after a short delay (to catch async localStorage writes)
      const timer = setTimeout(readFromStorage, 500)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="px-2 py-3">
              <h1 className="text-lg font-bold text-sidebar-foreground uppercase">Global Academy of Technology</h1>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
        {/* Additional actions */}
        <div className="px-3 mt-4">
          <div className="grid gap-2">
            <a href="/dashboard/personal" className="block w-full">
              <button className="w-full rounded-md bg-sidebar-accent hover:bg-sidebar-accent/80 px-3 py-2 text-sm text-sidebar-accent-foreground text-left transition-colors">
                Personal Details
              </button>
            </a>
            <a href="/dashboard/attendance" className="block w-full">
              <button className="w-full rounded-md bg-sidebar-accent hover:bg-sidebar-accent/80 px-3 py-2 text-sm text-sidebar-accent-foreground text-left transition-colors">
                Attendance
              </button>
            </a>
            <a href="/dashboard/performance" className="block w-full">
              <button className="w-full rounded-md bg-sidebar-accent hover:bg-sidebar-accent/80 px-3 py-2 text-sm text-sidebar-accent-foreground text-left transition-colors">
                Previous Performance
              </button>
            </a>
          </div>
        </div>
        <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>
      {showUser && (
        <SidebarFooter>
          <NavUser user={{ ...sidebarData.user, name: userName }} />
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
