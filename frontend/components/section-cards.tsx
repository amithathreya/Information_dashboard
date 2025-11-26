import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface SectionCardsProps {
  name: string;
  usn: string;
  department: string;
  academicYear: string;
  semester?: string;
  academicData?: any;
}

export function SectionCards({ name, usn, department, academicYear, semester, academicData }: SectionCardsProps) {
  // Extract GPA values from academicData
  const previousSemesterGPA = academicData?.PreviousSemesterGPA ?? "-";
  const cumulativeGPA = academicData?.CumulativeGPA ?? "-";
  return (
    <div className="grid grid-cols-1 gap-3 pl-4 pr-0 lg:pl-6 lg:pr-0 w-full @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card flex-row items-stretch px-3 py-2 !bg-sky-100 border border-sky-300">
        <div className="flex-1">
          <CardHeader className="px-2 py-1">
            <CardDescription> Student Name </CardDescription>
            <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">
              {name}
            </CardTitle>
            <CardAction />
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm px-2 py-1">
          </CardFooter>
        </div>
        <div className="m-1 w-1/4 flex-shrink-0 flex items-center justify-center">
          <img
            src="/image.png"
            alt={`${name} avatar`}
            className="h-20 w-20 object-cover rounded-md border border-sky-300"
          />
        </div>
      </Card>
      <Card className="@container/card py-2 !bg-sky-100 border border-sky-300">
        <CardHeader>
          <CardDescription>Current Semester</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">
            {semester ?? academicYear}
          </CardTitle>
          <CardAction>
            
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">

            <div className="line-clamp-1 flex gap-2 font-medium">
              {`Semester ${semester ?? academicYear}`}
            </div>
        </CardFooter>
      </Card>
      <Card className="@container/card !bg-sky-100 border border-sky-300">
        <CardHeader>    
          <CardDescription>Semester GPA</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {previousSemesterGPA}
          </CardTitle>
          <CardAction>
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card !bg-sky-100 border border-sky-300">
        <CardHeader>
          <CardDescription>Department</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          </CardTitle>
          <CardAction>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">
            {department}
          </CardTitle>
        </CardFooter>
      </Card>
      
    </div>
  )
}
