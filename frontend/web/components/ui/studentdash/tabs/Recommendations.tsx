'use client';

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";

interface Props {
  enrollments: any[];
  courses: any[];
}

export function Recommendations({ enrollments, courses }: Props) {
  const enrolledCourseIds = enrollments.map((e) => e.course._id);
  const enrolledCategories = enrollments.map((e) => e.course.category);

  // Recommended: same category + not already enrolled
  const recommendedCourses = courses.filter((course) => 
    !enrolledCourseIds.includes(course._id) && enrolledCategories.includes(course.category)
  );

  return (
    <Card>
      <CardHeader>
        <div className="text-lg font-semibold">Recommended Courses</div>
        <div className="text-sm text-muted-foreground">Based on your learning history</div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(
          recommendedCourses.map((course, idx) => (
            <div key={idx} className="flex items-center">
              <div className="h-16 w-16 rounded-md overflow-hidden mr-4">
                <img src="/placeholder.svg" alt={course.title} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{course.title}</p>
                <p className="text-xs text-muted-foreground">{course.tutor} • {course.rating} ★ • {course.students} students </p>
                <p className="text-xs text-muted-foreground">{course.category} • {course.level}</p>
                <p className="text-sm font-medium">${course.pricing?.online?.price || 0}</p>
              </div>
              <Button size="sm" asChild>
                <Link href={`/student/explore/${course._id}`}>Enroll</Link>
              </Button>
            </div>
          ))
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/student/explore">Explore More</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
