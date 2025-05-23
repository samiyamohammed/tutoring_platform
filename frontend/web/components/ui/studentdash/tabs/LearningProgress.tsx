'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Props {
  enrollments: any[];
}

export function LearningProgress({ enrollments }: Props) {
  // Prepare course progress data
  const progressData = enrollments.map((e) => ({
    course: e.course.title,
    completion: e.progress?.completionPercentage || 0,
  }));

  // Prepare assessment scores data
  const assessmentScores = enrollments.flatMap((e) =>
    (e.progress?.assessments || []).map((a: any) => ({
      course: e.course.title,
      score: a.bestScore || 0,
    }))
  );

  return (
    <div className="space-y-4">
      {/* Learning Progress Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Progress</CardTitle>
          <CardDescription>Track your completion percentage across courses</CardDescription>
        </CardHeader>
        <CardContent>
        <CardContent>
  {progressData.length === 0 ? (
    <div className="text-center text-muted-foreground py-8">
      No enrolled courses yet.
    </div>
  ) : (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px]"> {/* Minimum width for charts to scroll */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="course" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="completion" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )}
</CardContent>

        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Assessment Scores Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Scores</CardTitle>
            <CardDescription>Your performance in quizzes and exams</CardDescription>
          </CardHeader>
          <CardContent>
            {assessmentScores.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No assessments attempted yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={assessmentScores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="course" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Static Learning Goals */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Goals</CardTitle>
            <CardDescription>Your personal goals and progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { goal: "Complete 3 courses", progress: 30 },
              { goal: "Study 20 hours this month", progress: 45 },
              { goal: "Earn 2 certificates", progress: 50 },
            ].map((goal, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{goal.goal}</span>
                  <span>{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
