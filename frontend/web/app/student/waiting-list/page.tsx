"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, Calendar, Clock, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { StudentSidebar } from "@/components/student-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define types for our data
type Tutor = {
  name: string;
  avatar: string;
};

type Course = {
  id: string;
  title: string;
  tutor: Tutor;
  type: "group" | "oneOnOne";
  currentPosition: number;
  estimatedWaitTime: string;
  dateAdded: string;
  notificationEnabled: boolean;
};

// Mock data for waitlisted courses
const waitlistedCourses: Course[] = [
  {
    id: "1",
    title: "Advanced JavaScript Programming",
    tutor: {
      name: "John Smith",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    type: "group",
    currentPosition: 3,
    estimatedWaitTime: "2 weeks",
    dateAdded: "2023-05-10T10:30:00Z",
    notificationEnabled: true,
  },
  {
    id: "2",
    title: "Machine Learning Fundamentals",
    tutor: {
      name: "Jennifer Lee",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    type: "oneOnOne",
    currentPosition: 1,
    estimatedWaitTime: "3 days",
    dateAdded: "2023-05-12T14:45:00Z",
    notificationEnabled: true,
  },
  {
    id: "3",
    title: "UI/UX Design Principles",
    tutor: {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    type: "group",
    currentPosition: 8,
    estimatedWaitTime: "1 month",
    dateAdded: "2023-05-05T09:15:00Z",
    notificationEnabled: false,
  },
];

// Define props types for components
interface WaitlistedCourseCardProps {
  course: Course;
  onRemove: (courseId: string) => void;
  onToggleNotification: (courseId: string) => void;
}

interface EmptyWaitlistProps {
  searchQuery: string;
}

export default function WaitingListPage() {
  const { toast } = useToast()
  const [courses, setCourses] = useState<Course[]>(waitlistedCourses)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tutor.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleRemoveFromWaitlist = (courseId: string) => {
    setCourses(courses.filter((course) => course.id !== courseId))
    toast({
      title: "Removed from waitlist",
      description: "You have been removed from the waitlist for this course.",
    })
  }

  const toggleNotification = (courseId: string) => {
    setCourses(
      courses.map((course) =>
        course.id === courseId ? { ...course, notificationEnabled: !course.notificationEnabled } : course,
      ),
    )

    const course = courses.find((c) => c.id === courseId)
    toast({
      title: course?.notificationEnabled ? "Notifications disabled" : "Notifications enabled",
      description: course?.notificationEnabled
        ? "You will no longer receive notifications for this course."
        : "You will receive notifications when a spot becomes available.",
    })
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <StudentSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">Waiting List</h1>
              <p className="text-sm text-muted-foreground">Courses you're waiting to enroll in</p>
            </div>
          </div>
          <div className="flex-1 p-8 pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search waitlisted courses..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6">
              <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="all">All ({courses.length})</TabsTrigger>
                  <TabsTrigger value="group">
                    Group Sessions ({courses.filter((c) => c.type === "group").length})
                  </TabsTrigger>
                  <TabsTrigger value="oneOnOne">
                    One-on-One ({courses.filter((c) => c.type === "oneOnOne").length})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  {filteredCourses.length === 0 ? (
                    <EmptyWaitlist searchQuery={searchQuery} />
                  ) : (
                    <div className="space-y-4">
                      {filteredCourses.map((course) => (
                        <WaitlistedCourseCard
                          key={course.id}
                          course={course}
                          onRemove={handleRemoveFromWaitlist}
                          onToggleNotification={toggleNotification}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="group">
                  {filteredCourses.filter((c) => c.type === "group").length === 0 ? (
                    <EmptyWaitlist searchQuery={searchQuery} />
                  ) : (
                    <div className="space-y-4">
                      {filteredCourses
                        .filter((c) => c.type === "group")
                        .map((course) => (
                          <WaitlistedCourseCard
                            key={course.id}
                            course={course}
                            onRemove={handleRemoveFromWaitlist}
                            onToggleNotification={toggleNotification}
                          />
                        ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="oneOnOne">
                  {filteredCourses.filter((c) => c.type === "oneOnOne").length === 0 ? (
                    <EmptyWaitlist searchQuery={searchQuery} />
                  ) : (
                    <div className="space-y-4">
                      {filteredCourses
                        .filter((c) => c.type === "oneOnOne")
                        .map((course) => (
                          <WaitlistedCourseCard
                            key={course.id}
                            course={course}
                            onRemove={handleRemoveFromWaitlist}
                            onToggleNotification={toggleNotification}
                          />
                        ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

function WaitlistedCourseCard({ course, onRemove, onToggleNotification }: WaitlistedCourseCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={course.tutor.avatar || "/placeholder.svg"} alt={course.tutor.name} />
              <AvatarFallback>{course.tutor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{course.title}</h3>
              <p className="text-sm text-muted-foreground">Tutor: {course.tutor.name}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={course.type === "group" ? "secondary" : "default"}>
              {course.type === "group" ? "Group Session" : "One-on-One"}
            </Badge>
            <Badge variant="outline" className="bg-background">
              Position: {course.currentPosition}
            </Badge>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Est. wait: {course.estimatedWaitTime}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Added: {new Date(course.dateAdded).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={course.notificationEnabled ? "default" : "outline"}
              size="sm"
              className="h-8"
              onClick={() => onToggleNotification(course.id)}
            >
              {course.notificationEnabled ? "Notifications On" : "Notifications Off"}
            </Button>
          </div>
        </div>
        <div className="mt-4 flex justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/student/courses/${course.id}`}>
              <BookOpen className="mr-2 h-4 w-4" />
              View Course
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onRemove(course.id)}>
            <X className="mr-2 h-4 w-4" />
            Remove from Waitlist
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyWaitlist({ searchQuery }: EmptyWaitlistProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No courses found</CardTitle>
        <CardDescription>
          {searchQuery
            ? "No waitlisted courses match your search criteria."
            : "You are not on the waiting list for any courses."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <BookOpen className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-center text-muted-foreground">
          {searchQuery
            ? "Try adjusting your search or clear the search field."
            : "Browse courses and join waiting lists for full courses you're interested in."}
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" asChild>
          <Link href="/student/explore">
            <Search className="mr-2 h-4 w-4" />
            Explore Courses
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}