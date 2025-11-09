"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
} from "@tabler/icons-react"

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
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import {
  Command,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandInput,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
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
  const [userName, setUserName] = useState<string>(studentName ?? sidebarData.user.name)
  useEffect(() => {
    if (studentName && studentName.trim().length > 0) {
      setUserName(studentName)
      return
    }
    try {
      const n = localStorage.getItem("name") || localStorage.getItem("studentName") || localStorage.getItem("fullName")
      const usn = localStorage.getItem("usn")
      if (n && n.trim().length > 0) setUserName(n)
      else if (usn && usn.trim().length > 0) setUserName(usn)
    } catch (e) {
      // ignore
    }
  }, [studentName])

  const [semester, setSemester] = useState<string>("8");

  useEffect(() => {
    try {
      const s = localStorage.getItem("semester");
      if (s) setSemester(s);
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
        {/* Semester selector popover (below main nav) */}
        <div className="px-3 mt-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                {`Semester: ${semester}`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Select semester..." />
                <CommandList>
                  <CommandGroup heading="Semesters">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <CommandItem
                        key={s}
                        onSelect={() => {
                          try {
                            localStorage.setItem("semester", String(s));
                            setSemester(String(s));
                            // notify listeners (dashboard) to re-fetch
                            window.dispatchEvent(new CustomEvent('semester-changed', { detail: { semester: String(s) } }));
                          } catch (e) {
                            // ignore
                          }
                        }}
                      >
                        Semester {s}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <div className="mt-2 px-2 text-xs text-muted-foreground">Computer Science and Engineering</div>
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
