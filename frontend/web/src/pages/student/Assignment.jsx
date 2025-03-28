"use client"

import { useState } from "react"
import { Search, BookOpen, GraduationCap, Clock, FileText, CheckCircle } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

// Sample data
const assignmentsData = [
  {
    id: 1,
    title: "Final Project: Algorithm Implementation",
    course: "Introduction to Programming",
    status: "Pending",
    dueDate: "Dec 10, 11:59 PM",
    description:
      "Implement a sorting algorithm of your choice with analysis of time complexity and best/worst case scenarios.",
  },
  {
    id: 2,
    title: "Differential Equations Problem Set",
    course: "Advanced Mathematics",
    status: "Pending",
    dueDate: "Dec 12, 11:59 PM",
    description: "Complete problems 1-15 on second-order differential equations with detailed solutions.",
  },
  {
    id: 3,
    title: "Physics Lab Report: Pendulum Motion",
    course: "Physics Fundamentals",
    status: "Pending",
    dueDate: "Dec 8, 11:59 PM",
    description:
      "Write a detailed lab report on the pendulum experiment, including data analysis and error calculations.",
  },
  {
    id: 4,
    title: "Data Structures Analysis",
    course: "Introduction to Programming",
    status: "Submitted",
    dueDate: "Dec 2, 10:23 AM",
    description: "Analysis of different data structures and their applications in real-world programming scenarios.",
  },
  {
    id: 5,
    title: "Integral Calculus Problem Set",
    course: "Advanced Mathematics",
    status: "Submitted",
    dueDate: "Nov 28, 8:45 PM",
    description: "Comprehensive problem set covering integration techniques, applications, and theorems.",
  },
  {
    id: 6,
    title: "Kinematics Research Paper",
    course: "Physics Fundamentals",
    status: "Graded",
    dueDate: "Nov 25",
    description: "Research paper exploring advances in kinematics and their applications in modern physics.",
    grade: "92/100 (A)",
  },
]

// Main component
const Assignment = () => {
  const [searchTerm, setSearchTerm] = useState("")
  // eslint-disable-next-line no-unused-vars
  const [activeFilter, setActiveFilter] = useState("All")

  // Get unique statuses for tabs
  const statuses = ["All", ...new Set(assignmentsData.map((a) => a.status))]

  // Filter assignments based on search term and active filter
  const filteredAssignments = (status) => {
    return assignmentsData.filter((assignment) => {
      const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = status === "All" || assignment.status === status
      return matchesSearch && matchesFilter
    })
  }

  // Count assignments by status
  const countByStatus = (status) => {
    if (status === "All") return assignmentsData.length
    return assignmentsData.filter((a) => a.status === status).length
  }

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case "Pending":
        return "pending"
      case "Submitted":
        return "submitted"
      case "Graded":
        return "graded"
      default:
        return "default"
    }
  }

  // Get course icon
  const getCourseIcon = (course) => {
    if (course.includes("Programming")) return <FileText className="h-4 w-4" />
    if (course.includes("Mathematics")) return <BookOpen className="h-4 w-4" />
    if (course.includes("Physics")) return <GraduationCap className="h-4 w-4" />
    return <BookOpen className="h-4 w-4" />
  }

  // Render assignment cards
  const renderAssignmentCards = (status) => {
    const assignments = filteredAssignments(status)
    return assignments.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((assignment) => (
          <Card key={assignment.id} className="overflow-hidden">
            <div
              className={`h-3 ${
                assignment.status === "Pending"
                  ? "bg-yellow-500"
                  : assignment.status === "Submitted"
                    ? "bg-blue-500"
                    : "bg-green-500"
              }`}
            />

            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  {getCourseIcon(assignment.course)}
                  <span>{assignment.course}</span>
                </div>
                <Badge variant={getStatusVariant(assignment.status)}>{assignment.status}</Badge>
              </div>
              <h3 className="text-lg font-semibold leading-tight">{assignment.title}</h3>
            </CardHeader>

            <CardContent>
              <div
                className={`flex items-center gap-1.5 text-sm mb-4 ${
                  assignment.status === "Pending" ? "text-red-500" : "text-muted-foreground"
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>Due {assignment.dueDate}</span>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-3">{assignment.description}</p>

              {assignment.grade && (
                <div className="flex items-center gap-1.5 mt-4 text-sm font-medium text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>{assignment.grade}</span>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex gap-3">
              {assignment.status === "Pending" ? (
                <Button variant="pending" className="flex-1">
                  Start Assignment
                </Button>
              ) : (
                <Button variant="outline" className="flex-1">
                  View Submission
                </Button>
              )}

              {assignment.status === "Graded" && <Button variant="success">View Feedback</Button>}
            </CardFooter>
          </Card>
        ))}
      </div>
    ) : (
      <p className="text-muted-foreground text-center">No assignments found.</p>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>

        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:flex-initial">
            <Input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 w-full"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Button variant="default">Search</Button>
        </div>
      </div>

      <Tabs defaultValue="All" className="mb-8">
        <TabsList className="mb-4 w-full md:w-auto overflow-x-auto">
          {statuses.map((status) => (
            <TabsTrigger key={status} value={status} onClick={() => setActiveFilter(status)}>
              {status} ({countByStatus(status)})
            </TabsTrigger>
          ))}
        </TabsList>

        {statuses.map((status) => (
          <TabsContent key={status} value={status}>
            {renderAssignmentCards(status)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export default Assignment
