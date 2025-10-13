"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { Bar, BarChart } from "recharts"


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
    label: "Desktop",
    color: "#2563eb",
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
  <Card className="@container/card max-w-2xl mx-auto p-4">
      <CardHeader className="py-2 px-2">
        <CardTitle className="text-base">Attendance Report</CardTitle>
      </CardHeader>
      <ChartContainer config={chartConfig} className="min-h-[100px] w-full">
        {isEmpty ? (
          <div className="text-center py-8 text-muted-foreground">No attendance data available.</div>
        ) : (
          <BarChart accessibilityLayer data={barChartData} width={540} height={140}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="course"
              tickLine={false}
              tickMargin={12}
              axisLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 12, fill: '#333' }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="attendance" fill="var(--color-desktop)" radius={4} barSize={40} />
          </BarChart>
        )}
      </ChartContainer>
    </Card>
  );
}
