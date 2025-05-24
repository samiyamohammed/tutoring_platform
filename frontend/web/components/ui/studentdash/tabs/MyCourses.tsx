'use client';

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

interface Props {
  enrollments: any[];
}

export function MyCourses({ enrollments }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
     {enrollments.map((e) => ( 
        <Card key={e._id}>
          <CardHeader className="p-0">
            <div className="aspect-video w-full overflow-hidden rounded-t-lg">
              <img src="/placeholder.svg" alt={e.course.title} className="h-full w-full object-cover" />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="line-clamp-1 font-bold">{e.course.title}</div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Tutor: {e.course.tutor.name}</span>
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 fill-primary text-primary" />
                  <span>4.8</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{e.progress?.completionPercentage || 0}%</span>
                </div>
                <Progress value={e.progress?.completionPercentage || 0} className="h-2" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/student/my-courses/course-detail/${e.course._id}`}>Continue Learning</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
