"use client"

import { useState } from "react"
import { Search, Calendar, BookOpen, Award, CheckCircle, FileText, GraduationCap, Timer } from "lucide-react"

// Import shadcn components
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const Quizzes = () => {
  const [activeFilter, setActiveFilter] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")

  const quizzes = [
    {
      title: "Recursion and Algorithms",
      course: "Introduction to Programming",
      dueDate: "Dec 15, 11:59 PM",
      duration: "60 min",
      status: "Available",
      description: "25 questions covering recursion, algorithm analysis, and implementation strategies.",
    },
    {
      title: "Differential Equations",
      course: "Advanced Mathematics",
      dueDate: "Dec 12, 11:59 PM",
      duration: "45 min",
      status: "Available",
      description: "15 questions on solving and applications of differential equations in various fields.",
    },
    {
      title: "Classical Mechanics",
      course: "Physics Fundamentals",
      dueDate: "Dec 9, 11:59 PM",
      duration: "30 min",
      status: "Available",
      description: "20 questions covering Newton's laws, energy conservation, and classical mechanics problems.",
    },
    {
      title: "Variables and Data Types",
      course: "Introduction to Programming",
      completionDate: "Nov 20",
      score: "23/25",
      percentage: "92%",
      feedback: "Great work on understanding data types and variables in programming!",
      status: "Completed",
    },
    {
      title: "Limits and Continuity",
      course: "Advanced Mathematics",
      completionDate: "Nov 15",
      score: "14/16",
      percentage: "88%",
      feedback: "Good understanding of limits and continuity concepts.",
      status: "Completed",
    },
    {
      title: "Kinematics",
      course: "Physics Fundamentals",
      completionDate: "Nov 10",
      score: "16/20",
      percentage: "78%",
      feedback: "Good work, but review sections on projectile motion.",
      status: "Completed",
    },
    {
      title: "HTML and CSS Basics",
      course: "Web Development Basics",
      completionDate: "Nov 5",
      score: "19/20",
      percentage: "95%",
      feedback: "Excellent understanding of HTML and CSS fundamentals!",
      status: "Completed",
    },
  ]

  // Filter quizzes based on search term and active filter
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = activeFilter === "All" || quiz.status === activeFilter
    return matchesSearch && matchesFilter
  })

  // Count quizzes by status
  const countByStatus = (status) => {
    if (status === "All") return quizzes.length
    return quizzes.filter((q) => q.status === status).length
  }

  // Get course icon
  const getCourseIcon = (course) => {
    if (course.includes("Programming")) return <FileText className="h-4 w-4" />
    if (course.includes("Mathematics")) return <BookOpen className="h-4 w-4" />
    if (course.includes("Physics")) return <GraduationCap className="h-4 w-4" />
    if (course.includes("Web")) return <FileText className="h-4 w-4" />
    return <BookOpen className="h-4 w-4" />
  }

  // Render quiz cards
  const renderQuizCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredQuizzes.map((quiz, index) => (
          <Card key={index} className="overflow-hidden">
            {/* Color indicator at top of card */}
            <div className={`h-2 ${quiz.status === "Available" ? "bg-blue-500" : "bg-green-500"}`} />

            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {getCourseIcon(quiz.course)}
                  <span>{quiz.course}</span>
                </div>
                <Badge
                  variant={quiz.status === "Available" ? "secondary" : "success"}
                  className={
                    quiz.status === "Available"
                      ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                      : "bg-green-100 text-green-800 hover:bg-green-200"
                  }
                >
                  {quiz.status}
                </Badge>
              </div>

              <h3 className="text-xl font-semibold mb-2">{quiz.title}</h3>

              {/* Conditional content based on status */}
              {quiz.status === "Available" ? (
                <>
                  <div className="flex items-center gap-1.5 text-sm text-red-500 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>Due by {quiz.dueDate}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                    <Timer className="h-4 w-4" />
                    <span>Duration: {quiz.duration}</span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">{quiz.description}</p>

                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Start Quiz</Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>Completed on {quiz.completionDate}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm font-medium text-green-600 mb-2">
                    <Award className="h-4 w-4" />
                    <span>
                      Score: {quiz.score} ({quiz.percentage})
                    </span>
                  </div>

                  <div className="flex items-start gap-1.5 text-sm text-muted-foreground mb-6">
                    <CheckCircle className="h-4 w-4 mt-0.5" />
                    <span>{quiz.feedback}</span>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1">
                      View Results
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700">View Feedback</Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <section className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>

        <div className="relative w-full md:w-auto">
          <Input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 w-full md:w-[300px]"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <Tabs defaultValue="All" className="mb-8" onValueChange={setActiveFilter} value={activeFilter}>
        <TabsList className="mb-6 w-full md:w-auto overflow-x-auto">
          {["All", "Available", "Completed"].map((status) => (
            <TabsTrigger key={status} value={status}>
              {status} ({countByStatus(status)})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeFilter}>{renderQuizCards()}</TabsContent>
      </Tabs>
    </section>
  )
}

export default Quizzes

