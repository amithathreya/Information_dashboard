"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, Bar, BarChart, ResponsiveContainer } from "recharts"


import { useIsMobile} from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig: ChartConfig = {
  desktop: {
    label: "Attendance",
    color: "#10b981", // emerald
  },
  highlight: {
    label: "Highlight",
    color: "#f59e0b", // amber accent
  },
};

interface ChartAreaInteractiveProps {
  name: string;
  usn: string;
  department: string;
  academicYear: string;
  attendanceData?: any[];
}

export function ChartAreaInteractive(props: ChartAreaInteractiveProps) {
  const { name, usn, department, academicYear, attendanceData = [] } = props;
  // Debug: log the attendanceData to check its structure
  // Debug logging removed

  // Map attendanceData to extract Course_Name and AttendancePct for the chart
  const barChartData = Array.isArray(attendanceData)
    ? attendanceData
        .filter((item: any) => item && typeof item.Course_Name === 'string' && typeof item.AttendancePct === 'number')
        .map((item: any) => ({
          course: item.Course_Name,
          attendance: item.AttendancePct,
        }))
    : [];

  const isEmpty = !barChartData.length;

  return (
  <Card className="@container/card w-full p-3 !bg-sky-100 border border-sky-300">
      <CardHeader className="py-1 px-2">
        <CardTitle className="text-base">Attendance Report</CardTitle>
      </CardHeader>
      <ChartContainer config={chartConfig} className="min-h-[80px] w-full">
        {isEmpty ? (
          <div className="text-center py-8 text-muted-foreground">No attendance data available.</div>
        ) : (
          <ResponsiveContainer width="100%" height={120}>
            <BarChart accessibilityLayer data={barChartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="course"
                tickLine={false}
                tickMargin={8}
                axisLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={48}
                tick={{ fontSize: 11, fill: '#333' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="attendance" fill="var(--color-desktop)" radius={6} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartContainer>
    </Card>
  );
}
