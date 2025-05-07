"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { BookOpen, CheckCircle, Clock, FileText, ChevronLeft, ChevronRight, Video, File, ListChecks, Award, User, BarChart2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentSidebar } from "@/components/student-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

interface Course {
  _id: string
  title: string
  description: string
  thumbnail?: string
  estimatedDuration: number
  tutor: {
    _id: string
    name: string
    avatar?: string
    bio?: string
  }
  modules: {
    _id: string
    title: string
    description?: string
    order: number
    sections: Array<{
      _id: string
      title: string
      order: number
      type: 'text' | 'video' | 'pdf' | 'quiz'
      content?: string
      videoUrl?: string
      pdfUrl?: string
      quiz?: {
        _id: string
        title: string
        duration: number
        questions: Array<{
          questionText: string
          questionType: 'single' | 'multiple'
          options: string[]
          correctAnswers: number[]
        }>
      }
    }>
  }[]
}

interface Enrollment {
  _id: string
  currentStatus: 'enrolled' | 'in_progress' | 'completed' | 'dropped' | 'suspended'
  enrolledAt: string
  progress: {
    modules: Array<{
      moduleId: string
      status: 'not_started' | 'started' | 'completed'
      startedAt?: string
      completedAt?: string
      lastAccessed?: string
      timeSpent: number
      sections: Array<{
        sectionId: string
        status: 'not_started' | 'in_progress' | 'completed'
        startedAt?: string
        completedAt?: string
        lastAccessed?: string
        timeSpent: number
        notes?: Array<{
          content: string
          createdAt: string
        }>
      }>
    }>
    assessments?: Array<{
      assessmentId: string
      assessmentType: 'quiz' | 'assignment' | 'exam'
      sectionId: string
      attempts: Array<{
        attemptNumber: number
        startedAt: string
        submittedAt?: string
        score?: number
        passingScore?: number
        passed?: boolean
        answers?: any
        feedback?: string
      }>
      bestScore?: number
      passed?: boolean
      required: boolean
    }>
    completionPercentage: number
    lastActivity?: string
    timeSpentTotal: number
    currentModule?: string
    currentSection?: string
  }
  certification?: {
    eligible: boolean
    issued: boolean
    issuedAt?: string
    certificateId?: string
    expirationDate?: string
  }
}

export default function CourseLearningPage() {
  const { courseId } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [course, setCourse] = useState<Course | null>(null)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeModuleIndex, setActiveModuleIndex] = useState(0)
  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const [videoProgress, setVideoProgress] = useState<number>(0)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number[]>>({})
  const [sectionNotes, setSectionNotes] = useState<string>("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") || '' : ''
        
        // Fetch course and enrollment data in parallel
        const [courseRes, enrollmentRes] = await Promise.all([
          fetch(`http://localhost:5000/api/course/${courseId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`http://localhost:5000/api/enrollment/currentenrollment/${courseId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          })
        ])

        if (!courseRes.ok) throw new Error('Failed to fetch course')
        if (!enrollmentRes.ok) throw new Error('Failed to fetch enrollment')

        const courseData = await courseRes.json()
        const enrollmentData = await enrollmentRes.json()

        setCourse(courseData)
        setEnrollment(enrollmentData)

        // Set initial module/section based on enrollment progress
        if (enrollmentData.progress.currentModule) {
          const moduleIndex = courseData.modules.findIndex(
            (m: any) => m._id === enrollmentData.progress.currentModule
          )
          if (moduleIndex >= 0) {
            setActiveModuleIndex(moduleIndex)
            if (enrollmentData.progress.currentSection) {
              const sectionIndex = courseData.modules[moduleIndex].sections.findIndex(
                (s: any) => s._id === enrollmentData.progress.currentSection
              )
              if (sectionIndex >= 0) setActiveSectionIndex(sectionIndex)
            }
          }
        }

      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load course data",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [courseId, toast])

  const updateProgress = async (moduleId: string, sectionId: string, timeSpent: number = 1) => {
    try {
      const token = localStorage.getItem("token") || ''
      const response = await fetch(`http://localhost:5000/api/enrollment/${enrollment?._id}/progress`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          moduleId,
          sectionId,
          timeSpent
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update progress')
      }
      
      const data = await response.json()
      setEnrollment(data)
      return data
    } catch (error) {
      console.error("Error updating progress:", error)
      throw error
    }
  }

  const markSectionComplete = async () => {
    if (!course || !enrollment) return;
    
    setIsMarkingComplete(true);
    try {
      const token = localStorage.getItem("token") || '';
      const currentModule = course.modules[activeModuleIndex];
      const currentSection = currentModule.sections[activeSectionIndex];
      
      const response = await fetch(
        `http://localhost:5000/api/enrollment/${enrollment._id}/complete-section`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            moduleId: currentModule._id,
            sectionId: currentSection._id,
            notes: sectionNotes
          })
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark section complete');
      }
  
      const updatedEnrollment = await response.json();
      setEnrollment(updatedEnrollment);
      setSectionNotes("");
      
      // Move to next section if not last
      const isLastSection = activeSectionIndex === currentModule.sections.length - 1;
      const isLastModule = activeModuleIndex === course.modules.length - 1;
      
      if (!isLastSection) {
        setActiveSectionIndex(activeSectionIndex + 1);
      } else if (!isLastModule) {
        setActiveModuleIndex(activeModuleIndex + 1);
        setActiveSectionIndex(0);
      }
  
      toast({
        title: "Success",
        description: "Section marked as completed!",
      });
    } catch (error) {
      console.error("Error marking section complete:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsMarkingComplete(false);
    }
  }

  const addSectionNote = async () => {
    if (!sectionNotes.trim() || !enrollment) return
    
    try {
      const token = localStorage.getItem("token") || ''
      const currentModule = course?.modules[activeModuleIndex]
      const currentSection = currentModule?.sections[activeSectionIndex]
      
      const response = await fetch(
        `http://localhost:5000/api/enrollment/${enrollment._id}/notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            moduleId: currentModule?._id,
            sectionId: currentSection?._id,
            note: sectionNotes
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to add note')
      }

      const updatedEnrollment = await response.json()
      setEnrollment(updatedEnrollment)
      setSectionNotes("")
      
      toast({
        title: "Success",
        description: "Note added successfully!",
      })
    } catch (error) {
      console.error("Error adding note:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add note",
      })
    }
  }

  const getModuleProgress = (moduleId: string) => {
    if (!enrollment) return null
    return enrollment.progress.modules.find(m => m.moduleId === moduleId)
  }

  const getSectionProgress = (moduleId: string, sectionId: string) => {
    const moduleProgress = getModuleProgress(moduleId)
    if (!moduleProgress) return null
    return moduleProgress.sections.find(s => s.sectionId === sectionId)
  }

  const getSectionNotes = (moduleId: string, sectionId: string) => {
    const sectionProgress = getSectionProgress(moduleId, sectionId)
    return sectionProgress?.notes || []
  }

  const isSectionCompleted = (moduleId: string, sectionId: string) => {
    const sectionProgress = getSectionProgress(moduleId, sectionId)
    return sectionProgress?.status === 'completed'
  }

  const handleVideoProgress = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setVideoProgress(progress)
      
      // Auto-save progress every 10 seconds
      if (videoRef.current.currentTime % 10 < 0.1) {
        const currentModule = course?.modules[activeModuleIndex]
        const currentSection = currentModule?.sections[activeSectionIndex]
        if (currentModule && currentSection) {
          updateProgress(currentModule._id, currentSection._id, 10)
        }
      }
    }
  }

  const handleQuizAnswer = (questionIndex: number, answerIndex: number, isMultiple: boolean) => {
    setQuizAnswers(prev => {
      const newAnswers = { ...prev }
      if (isMultiple) {
        newAnswers[questionIndex] = newAnswers[questionIndex] || []
        if (newAnswers[questionIndex].includes(answerIndex)) {
          newAnswers[questionIndex] = newAnswers[questionIndex].filter(a => a !== answerIndex)
        } else {
          newAnswers[questionIndex] = [...newAnswers[questionIndex], answerIndex]
        }
      } else {
        newAnswers[questionIndex] = [answerIndex]
      }
      return newAnswers
    })
  }

  const submitQuiz = async () => {
    if (!course || !enrollment) return
    
    try {
      const token = localStorage.getItem("token") || ''
      const currentModule = course.modules[activeModuleIndex]
      const currentSection = currentModule.sections[activeSectionIndex]
      
      const response = await fetch(
        `http://localhost:5000/api/enrollment/${enrollment._id}/submit-quiz`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            moduleId: currentModule._id,
            sectionId: currentSection._id,
            quizId: currentSection.quiz?._id,
            answers: quizAnswers
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit quiz')
      }

      const updatedEnrollment = await response.json()
      setEnrollment(updatedEnrollment)
      setQuizAnswers({})
      
      toast({
        title: "Success",
        description: "Quiz submitted successfully!",
      })
    } catch (error) {
      console.error("Error submitting quiz:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit quiz",
      })
    }
  }

  const navigateToSection = (moduleIndex: number, sectionIndex: number) => {
    setActiveModuleIndex(moduleIndex)
    setActiveSectionIndex(sectionIndex)
    
    // Update progress when navigating
    const module = course?.modules[moduleIndex]
    const section = module?.sections[sectionIndex]
    if (module && section) {
      updateProgress(module._id, section._id)
    }
  }

  if (loading) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <StudentSidebar />
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <Skeleton className="h-6 w-48" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-24" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2 w-32" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  if (!course || !enrollment) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <StudentSidebar />
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h1 className="text-lg font-semibold">Course Not Found</h1>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <Button onClick={() => router.push('/student/my-courses')}>
                Back to My Courses
              </Button>
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  const currentModule = course.modules[activeModuleIndex]
  const currentSection = currentModule.sections[activeSectionIndex]
  const moduleProgress = getModuleProgress(currentModule._id)
  const sectionProgress = getSectionProgress(currentModule._id, currentSection._id)
  const sectionNotesList = getSectionNotes(currentModule._id, currentSection._id)
  const isCourseCompleted = enrollment.currentStatus === 'completed'

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />
      case 'pdf': return <File className="h-4 w-4" />
      case 'quiz': return <ListChecks className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <StudentSidebar />
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <Button variant="ghost" onClick={() => router.push('/student/my-courses')}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to My Courses
            </Button>
            <div className="flex items-center gap-4">
              <Badge variant={
                enrollment.currentStatus === 'completed' ? 'default' : 
                enrollment.currentStatus === 'in_progress' ? 'secondary' : 'outline'
              } className="capitalize">
                {enrollment.currentStatus.replace('_', ' ')}
              </Badge>
              {enrollment.certification?.eligible && (
                <Badge variant={enrollment.certification.issued ? 'default' : 'secondary'}>
                  {enrollment.certification.issued ? (
                    <div className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      <span>Certified</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      <span>Eligible</span>
                    </div>
                  )}
                </Badge>
              )}
              <div className="flex items-center gap-2">
                <Progress value={enrollment.progress.completionPercentage} className="h-2 w-32" />
                <span className="text-sm">{Math.round(enrollment.progress.completionPercentage)}%</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="hidden md:block w-64 border-r overflow-y-auto">
              <div className="p-4">
                <h2 className="font-semibold text-lg mb-2">{course.title}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={course.tutor?.avatar} />
                    <AvatarFallback>{course.tutor?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{course.tutor?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{course.estimatedDuration} hours total</span>
                </div>
              </div>
              
              <div className="space-y-2 px-2">
                {course.modules.map((module, moduleIndex) => {
                  const modProgress = getModuleProgress(module._id)
                  return (
                    <div key={`module-${module._id}`} className="space-y-1">
                      <div 
                        className={`p-2 rounded-md font-medium cursor-pointer flex items-center justify-between ${activeModuleIndex === moduleIndex ? 'bg-secondary' : 'hover:bg-secondary/50'}`}
                        onClick={() => {
                          setActiveModuleIndex(moduleIndex)
                          setActiveSectionIndex(0)
                          updateProgress(module._id, module.sections[0]._id)
                        }}
                      >
                        <span>{module.title}</span>
                        {modProgress?.status === 'completed' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <div className="pl-4 space-y-1">
                        {module.sections.map((section, sectionIndex) => {
                          const sectProgress = getSectionProgress(module._id, section._id)
                          return (
                            <div
                              key={`section-${section._id}`}
                              className={`p-2 text-sm rounded-md flex items-center gap-2 cursor-pointer ${activeModuleIndex === moduleIndex && activeSectionIndex === sectionIndex ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/30'}`}
                              onClick={() => navigateToSection(moduleIndex, sectionIndex)}
                            >
                              {getSectionIcon(section.type)}
                              <span className="truncate">{section.title}</span>
                              {sectProgress?.status === 'completed' || isCourseCompleted ? (
                                <CheckCircle className="h-4 w-4 ml-auto text-green-500" />
                              ) : sectProgress?.status === 'in_progress' ? (
                                <div className="h-2 w-2 ml-auto rounded-full bg-blue-500"></div>
                              ) : null}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold">{currentModule.title}</h1>
                    <h2 className="text-xl font-semibold mt-2">{currentSection.title}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{course.tutor.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart2 className="h-4 w-4" />
                        <span>{Math.round(enrollment.progress.completionPercentage)}% complete</span>
                      </div>
                      {(sectionProgress?.timeSpent ?? 0) > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{sectionProgress ? Math.floor(sectionProgress.timeSpent / 60) : 0} min spent</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={activeSectionIndex === 0 && activeModuleIndex === 0}
                      onClick={() => {
                        if (activeSectionIndex > 0) {
                          setActiveSectionIndex(activeSectionIndex - 1)
                        } else if (activeModuleIndex > 0) {
                          setActiveModuleIndex(activeModuleIndex - 1)
                          setActiveSectionIndex(course.modules[activeModuleIndex - 1].sections.length - 1)
                        }
                      }}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={activeSectionIndex === currentModule.sections.length - 1 && 
                               activeModuleIndex === course.modules.length - 1}
                      onClick={() => {
                        if (activeSectionIndex < currentModule.sections.length - 1) {
                          setActiveSectionIndex(activeSectionIndex + 1)
                        } else if (activeModuleIndex < course.modules.length - 1) {
                          setActiveModuleIndex(activeModuleIndex + 1)
                          setActiveSectionIndex(0)
                        }
                      }}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
                
                {/* Section Content */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {getSectionIcon(currentSection.type)}
                      <CardTitle className="capitalize">{currentSection.type} Content</CardTitle>
                      {sectionProgress?.status === 'completed' && (
                        <Badge className="ml-auto" variant="secondary">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {currentSection.type === 'text' && (
                      <>
                        <div 
                          className="prose max-w-none" 
                          dangerouslySetInnerHTML={{ __html: currentSection.content || '' }}
                        />
                        {!isSectionCompleted(currentModule._id, currentSection._id) && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Add Note</h4>
                              <textarea
                                className="w-full p-2 border rounded-md text-sm"
                                rows={3}
                                value={sectionNotes}
                                onChange={(e) => setSectionNotes(e.target.value)}
                                placeholder="Add your notes about this section..."
                              />
                              <Button 
                                size="sm"
                                onClick={addSectionNote}
                                disabled={!sectionNotes.trim()}
                              >
                                Save Note
                              </Button>
                            </div>
                            <Button 
                              onClick={markSectionComplete}
                              disabled={isMarkingComplete}
                            >
                              {isMarkingComplete ? "Marking..." : "Mark as Complete"}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                    
                    {currentSection.type === 'video' && (
                      <div className="space-y-4">
                        <div className="aspect-video w-full bg-black rounded-md overflow-hidden">
                          <video 
                            ref={videoRef}
                            controls 
                            className="w-full h-full"
                            src={`http://localhost:5000${currentSection.videoUrl}`}
                            onTimeUpdate={handleVideoProgress}
                          />
                        </div>
                        <Progress value={videoProgress} className="h-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{Math.round(videoProgress)}% watched</span>
                        </div>
                        {!isSectionCompleted(currentModule._id, currentSection._id) && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Add Note</h4>
                              <textarea
                                className="w-full p-2 border rounded-md text-sm"
                                rows={3}
                                value={sectionNotes}
                                onChange={(e) => setSectionNotes(e.target.value)}
                                placeholder="Add your notes about this video..."
                              />
                              <Button 
                                size="sm"
                                onClick={addSectionNote}
                                disabled={!sectionNotes.trim()}
                              >
                                Save Note
                              </Button>
                            </div>
                            <Button 
                              onClick={markSectionComplete}
                              disabled={isMarkingComplete}
                            >
                              {isMarkingComplete ? "Marking..." : "Mark as Complete"}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {currentSection.type === 'pdf' && (
                      <div className="space-y-4">
                        <div className="h-[600px]">
                          <iframe 
                            src={`http://localhost:5000${currentSection.pdfUrl}`}
                            className="w-full h-full border rounded-md"
                            title={currentSection.title}
                          />
                        </div>
                        {!isSectionCompleted(currentModule._id, currentSection._id) && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Add Note</h4>
                              <textarea
                                className="w-full p-2 border rounded-md text-sm"
                                rows={3}
                                value={sectionNotes}
                                onChange={(e) => setSectionNotes(e.target.value)}
                                placeholder="Add your notes about this PDF..."
                              />
                              <Button 
                                size="sm"
                                onClick={addSectionNote}
                                disabled={!sectionNotes.trim()}
                              >
                                Save Note
                              </Button>
                            </div>
                            <Button 
                              onClick={markSectionComplete}
                              disabled={isMarkingComplete}
                            >
                              {isMarkingComplete ? "Marking..." : "Mark as Complete"}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {currentSection.type === 'quiz' && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          {currentSection.quiz && (
                            <h3 className="text-lg font-semibold">{currentSection.quiz?.title}</h3>
                          )}
                          <p className="text-sm text-muted-foreground">Duration: {currentSection.quiz?.duration} minutes</p>
                        </div>
                        <div className="space-y-8">
                          {currentSection.quiz?.questions.map((question, index) => (
                            <div key={`question-${index}`} className="space-y-3">
                              <p className="font-medium">{index + 1}. {question.questionText}</p>
                              <div className="space-y-2 pl-4">
                                {question.options.map((option, i) => (
                                  <div key={`option-${i}`} className="flex items-center space-x-2">
                                    <input 
                                      type={question.questionType === 'multiple' ? 'checkbox' : 'radio'}
                                      id={`q${index}-o${i}`}
                                      name={`question-${index}`}
                                      checked={quizAnswers[index]?.includes(i) || false}
                                      onChange={() => handleQuizAnswer(index, i, question.questionType === 'multiple')}
                                    />
                                    <label htmlFor={`q${index}-o${i}`} className="text-sm">
                                      {option}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button 
                          onClick={() => {
                            submitQuiz()
                            markSectionComplete()
                          }}
                          disabled={Object.keys(quizAnswers).length === 0 || isMarkingComplete}
                        >
                          {isMarkingComplete ? "Submitting..." : "Submit Quiz"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  
                  {/* Section Notes */}
                  {sectionNotesList.length > 0 && (
                    <CardFooter className="border-t pt-4">
                      <div className="w-full space-y-4">
                        <h4 className="font-medium">Your Notes</h4>
                        <div className="space-y-3">
                          {sectionNotesList.map((note, index) => (
                            <div key={`note-${index}`} className="p-3 bg-secondary/30 rounded-md text-sm">
                              <p>{note.content}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(note.createdAt).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardFooter>
                  )}
                </Card>
                
                {/* Course Info Tabs */}
                <Tabs defaultValue="overview" className="mt-6">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="modules">Modules</TabsTrigger>
                    <TabsTrigger value="tutor">Tutor</TabsTrigger>
                  </TabsList>
                  <TabsContent value="overview" className="mt-4">
                    <Card>
                      <CardContent className="p-6 space-y-4">
                        <h3 className="font-semibold text-lg">About This Course</h3>
                        <p className="text-sm">{course.description}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium">Duration</h4>
                            <p className="text-sm text-muted-foreground">{course.estimatedDuration} hours</p>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium">Your Progress</h4>
                            <p className="text-sm text-muted-foreground">{Math.round(enrollment.progress.completionPercentage)}% complete</p>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium">Enrollment Date</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(enrollment.enrolledAt).toLocaleDateString()}
                            </p>
                          </div>
                          {enrollment.certification?.issued && (
                            <div className="space-y-1">
                              <h4 className="text-sm font-medium">Certification</h4>
                              <p className="text-sm text-muted-foreground">
                                Issued on {new Date(enrollment.certification.issuedAt!).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="modules" className="mt-4">
                    <Card>
                      <CardContent className="p-6 space-y-6">
                        {course.modules.map((module) => {
                          const modProgress = getModuleProgress(module._id)
                          return (
                            <div key={`module-card-${module._id}`} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">{module.title}</h4>
                                {modProgress?.status === 'completed' && (
                                  <Badge variant="outline" className="text-green-600">
                                    Completed
                                  </Badge>
                                )}
                              </div>
                              {module.description && (
                                <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                              )}
                              <div className="mt-3 space-y-3">
                                {module.sections.map((section) => {
                                  const sectProgress = getSectionProgress(module._id, section._id)
                                  return (
                                    <div key={`section-card-${section._id}`} className="flex items-center gap-3 text-sm p-2 rounded hover:bg-secondary/30">
                                      {getSectionIcon(section.type)}
                                      <div className="flex-1">
                                        <p>{section.title}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{section.type}</p>
                                      </div>
                                      {sectProgress?.status === 'completed' ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                      ) : sectProgress?.status === 'in_progress' ? (
                                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                      ) : null}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="tutor" className="mt-4">
                    <Card>
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={course.tutor.avatar} />
                            <AvatarFallback>{course.tutor.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">{course.tutor.name}</h3>
                            <p className="text-sm text-muted-foreground">Course Instructor</p>
                          </div>
                        </div>
                        {course.tutor.bio && (
                          <div className="mt-4">
                            <h4 className="font-medium text-sm">About the Tutor</h4>
                            <p className="text-sm text-muted-foreground mt-1">{course.tutor.bio}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}