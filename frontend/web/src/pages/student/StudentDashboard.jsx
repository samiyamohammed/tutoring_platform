import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Clock, FileText } from "lucide-react"

const StatusCard = ({ title, value, icon, description, color }) => {
  const Icon = icon
  return (
    <Card className="border-none shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

const CourseCard = ({ course }) => {
  return (
    <Card className="overflow-hidden border-none shadow-md">
      <div className="h-32 bg-gradient-to-r from-emerald-800 to-emerald-600 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={course.image || "/placeholder.svg?height=128&width=384"}
            alt={course.title}
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="font-bold text-white text-lg">{course.title}</h3>
          <p className="text-white/80 text-sm">{course.instructor}</p>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">Progress</span>
          <span className="text-sm font-medium">{course.progress}%</span>
        </div>
        <Progress value={course.progress} className="h-2" />
        <div className="flex justify-between mt-4 text-sm">
          <span>
            {course.lessonsCompleted} / {course.totalLessons} lessons
          </span>
          <span className="text-emerald-700 font-medium">{course.nextLesson}</span>
        </div>
      </CardContent>
    </Card>
  )
}

const CourseList = () => {
  const courses = [
    {
      id: 1,
      title: "Introduction to Programming",
      instructor: "Dr. Jane Smith",
      progress: 75,
      lessonsCompleted: 9,
      totalLessons: 12,
      nextLesson: "Continue",
    },
    {
      id: 2,
      title: "Advanced Mathematics",
      instructor: "Prof. John Davis",
      progress: 45,
      lessonsCompleted: 5,
      totalLessons: 15,
      nextLesson: "Continue",
    },
    {
      id: 3,
      title: "Data Science Fundamentals",
      instructor: "Dr. Michael Chen",
      progress: 30,
      lessonsCompleted: 3,
      totalLessons: 10,
      nextLesson: "Continue",
    },
    {
      id: 4,
      title: "Web Development Bootcamp",
      instructor: "Sarah Johnson",
      progress: 90,
      lessonsCompleted: 18,
      totalLessons: 20,
      nextLesson: "Continue",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Courses</h2>
        <a href="#" className="text-emerald-700 text-sm font-medium hover:underline">
          View All
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  )
}

const UpcomingSessions = () => {
  const sessions = [
    {
      id: 1,
      title: "Data Structures Review",
      tutor: "Dr. Jane Smith",
      date: "Today",
      time: "3:00 PM - 4:00 PM",
      status: "upcoming",
    },
    {
      id: 2,
      title: "Calculus Problem Solving",
      tutor: "Prof. John Davis",
      date: "Tomorrow",
      time: "2:00 PM - 3:30 PM",
      status: "upcoming",
    },
    {
      id: 3,
      title: "Python Programming Help",
      tutor: "Dr. Michael Chen",
      date: "Mar 30, 2025",
      time: "1:00 PM - 2:00 PM",
      status: "upcoming",
    },
  ]

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Upcoming Sessions</CardTitle>
        <CardDescription>Your scheduled tutoring sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-start space-x-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="bg-emerald-100 p-2 rounded-full">
                <CalendarDays className="h-5 w-5 text-emerald-700" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between">
                  <p className="font-medium">{session.title}</p>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">{session.date}</span>
                </div>
                <p className="text-sm text-muted-foreground">with {session.tutor}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  {session.time}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <a href="#" className="text-sm text-emerald-700 hover:underline">
            View all sessions
          </a>
        </div>
      </CardContent>
    </Card>
  )
}

const PendingAssignment = () => {
  const assignments = [
    {
      id: 1,
      title: "Programming Assignment #3",
      course: "Introduction to Programming",
      dueDate: "Today",
      status: "urgent",
    },
    {
      id: 2,
      title: "Linear Algebra Problem Set",
      course: "Advanced Mathematics",
      dueDate: "Tomorrow",
      status: "upcoming",
    },
    {
      id: 3,
      title: "Data Analysis Project",
      course: "Data Science Fundamentals",
      dueDate: "Mar 30, 2025",
      status: "upcoming",
    },
  ]

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Pending Assignments</CardTitle>
        <CardDescription>Assignments due soon</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-start space-x-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className={`p-2 rounded-full ${assignment.status === "urgent" ? "bg-red-100" : "bg-amber-100"}`}>
                <FileText className={`h-5 w-5 ${assignment.status === "urgent" ? "text-red-700" : "text-amber-700"}`} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between">
                  <p className="font-medium">{assignment.title}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      assignment.status === "urgent" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    Due {assignment.dueDate}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{assignment.course}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <a href="#" className="text-sm text-emerald-700 hover:underline">
            View all assignments
          </a>
        </div>
      </CardContent>
    </Card>
  )
}

const StudentDashboard = () => {
  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <Tabs defaultValue="overview" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard
          title="Enrolled Courses"
          value="4"
          icon={FileText}
          description="Active courses this semester"
          color="text-emerald-600"
        />
        <StatusCard
          title="Upcoming Sessions"
          value="3"
          icon={CalendarDays}
          description="Scheduled for this week"
          color="text-blue-600"
        />
        <StatusCard
          title="Pending Assignments"
          value="3"
          icon={Clock}
          description="Due within 7 days"
          color="text-amber-600"
        />
      </div>

      <CourseList />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingSessions />
        <PendingAssignment />
      </div>
    </div>
  )
}

export default StudentDashboard

