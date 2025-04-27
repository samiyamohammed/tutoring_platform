'use client';

import { use, useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface Module {
  _id: string;
  title: string;
  description: string;
}

interface CourseDetail {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  tutor: {
    _id: string;
    name: string;
    email: string;
  };
  modules: Module[];
  progress: {
    completionPercentage: number;
  };
}

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params); 

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const studentId = user._id;

        if (!token || !studentId) {
          throw new Error('User not authenticated');
        }

        const response = await fetch(`http://localhost:5000/api/enrollment/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch enrollments');
        }

        const enrollments = await response.json();
        const found = enrollments.find((e: any) => e.course._id === courseId);

        if (found) {
          setCourse({
            _id: found.course._id,
            title: found.course.title,
            description: found.course.description,
            category: found.course.category,
            level: found.course.level,
            tutor: found.course.tutor,
            modules: found.course.modules || [],
            progress: found.progress || { completionPercentage: 0 },
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-10 text-muted-foreground">Course not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-10">
      {/* Course Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="text-muted-foreground">{course.category} - {course.level}</p>
        <p className="text-sm">Instructor: {course.tutor.name}</p>
      </div>

      {/* Progress */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Your Progress</h2>
        <Progress value={course.progress.completionPercentage} className="h-3" />
        <p>{course.progress.completionPercentage}% completed</p>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Course Modules</h2>
        {course.modules.length > 0 ? (
          <ul className="space-y-3">
            {course.modules.map((module) => (
              <li key={module._id} className="flex items-center justify-between border rounded-md p-4">
                <div>
                  <h3 className="text-lg font-medium">{module.title}</h3>
                  <p className="text-muted-foreground">{module.description}</p>
                </div>
                <Button variant="outline" size="sm">
                  Start
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No modules available yet.</p>
        )}
      </div>

      {/* Back to Dashboard */}
      <div className="pt-8">
        <Button asChild variant="default">
          <Link href="/student/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
