"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  CheckCircle,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  Video,
  File,
  ListChecks,
  Award,
  User,
  BarChart2,
  AlertCircle,
  Timer,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentSidebar } from "@/components/student-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  estimatedDuration: number;
  category: string;
  level: string;
  deadline?: string;
  tutor: {
    _id: string;
    name: string;
    avatar?: string;
    bio?: string;
  };
  modules: {
    _id: string;
    title: string;
    description?: string;
    order: number;
    sections: Array<{
      _id: string;
      title: string;
      order: number;
      type: "text" | "video" | "pdf" | "quiz";
      content?: string;
      videoUrl?: string;
      pdfUrl?: string;
      quiz?: {
        _id: string;
        title: string;
        duration: number;
        questions: Array<{
          questionText: string;
          questionType: "single" | "multiple";
          options: string[];
          correctAnswer: string;
          points: number;
        }>;
      };
    }>;
  }[];
  finalExam?: {
    _id: string;
    title: string;
    description: string;
    duration: number; // in minutes
    passingScore: number;
    questions: Array<{
      _id: string;
      questionText: string;
      options: string[];
      correctAnswer: string;
      points: number;
    }>;
  };
  assessment?: {
    preAssessment?: Array<{
      _id: string;
      questionText: string;
      type: "mcq" | "shortAnswer";
      options: string[];
      correctAnswer: string;
      points: number;
    }>;
    postAssessment?: Array<{
      _id: string;
      questionText: string;
      type: "mcq" | "shortAnswer";
      options: string[];
      correctAnswer: string;
      points: number;
    }>;
  };
}

interface Enrollment {
  _id: string;
  currentStatus:
    | "enrolled"
    | "in_progress"
    | "completed"
    | "dropped"
    | "suspended";
  enrolledAt: string;
  progress: {
    modules: Array<{
      moduleId: string;
      status: "not_started" | "started" | "completed";
      startedAt?: string;
      completedAt?: string;
      lastAccessed?: string;
      timeSpent: number;
      sections: Array<{
        sectionId: string;
        status: "not_started" | "in_progress" | "completed";
        startedAt?: string;
        completedAt?: string;
        lastAccessed?: string;
        timeSpent: number;
        notes?: Array<{
          content: string;
          createdAt: string;
        }>;
      }>;
    }>;
    assessments?: Array<{
      assessmentId: string;
      assessmentType: "quiz" | "assignment" | "exam" | "pre" | "post";
      sectionId: string;
      attempts: Array<{
        attemptNumber: number;
        startedAt: string;
        submittedAt?: string;
        score?: number;
        passingScore?: number;
        passed?: boolean;
        answers?: any;
        feedback?: string;
      }>;
      bestScore?: number;
      passed?: boolean;
      required: boolean;
    }>;
    completionPercentage: number;
    lastActivity?: string;
    timeSpentTotal: number;
    currentModule?: string;
    currentSection?: string;
  };
  certification?: {
    eligible: boolean;
    issued: boolean;
    issuedAt?: string;
    certificateId?: string;
    expirationDate?: string;
  };
  finalExam?: {
    attempts: Array<{
      attemptNumber: number;
      startedAt: string;
      submittedAt?: string;
      durationUsed?: number;
      score?: number;
      passed?: boolean;
      answers?: any;
      feedback?: string;
    }>;
    bestScore?: number;
    passed?: boolean;
    taken?: boolean;
    lastAttemptDate?: string;
  };
  assessmentResponses?: {
    preAssessment?: Array<{
      questionId: string;
      questionText: string;
      response: string;
      correctAnswer: string;
      isCorrect: boolean;
      answeredAt: string;
    }>;
    postAssessment?: Array<{
      questionId: string;
      questionText: string;
      response: string;
      correctAnswer: string;
      isCorrect: boolean;
      answeredAt: string;
    }>;
  };
}

export default function CourseLearningPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [showFinalExam, setShowFinalExam] = useState(false);
  const [showPreAssessment, setShowPreAssessment] = useState(false);
  const [showPostAssessment, setShowPostAssessment] = useState(false);
  const [examInProgress, setExamInProgress] = useState(false);
  const [examTimeLeft, setExamTimeLeft] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [preAssessmentAnswers, setPreAssessmentAnswers] = useState<
    Record<string, string>
  >({});
  const [postAssessmentAnswers, setPostAssessmentAnswers] = useState<
    Record<string, string>
  >({});
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number[]>>({});
  const [sectionNotes, setSectionNotes] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [timeSpentInterval, setTimeSpentInterval] =
    useState<NodeJS.Timeout | null>(null);
  const examTimerRef = useRef<NodeJS.Timeout | null>(null);
  const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") || ""
            : "";

        const [courseRes, enrollmentRes] = await Promise.all([
          fetch(`${baseUrl}/api/course/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(
            `${baseUrl}/api/enrollment/currentEnrollment/${courseId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        if (!courseRes.ok) throw new Error("Failed to fetch course");
        if (!enrollmentRes.ok) throw new Error("Failed to fetch enrollment");

        const courseData = await courseRes.json();
        const enrollmentData = await enrollmentRes.json();

        setCourse(courseData);
        setEnrollment(enrollmentData);

        // Check if pre-assessment needs to be shown
        const hasPreAssessment =
          courseData.assessment?.preAssessment?.length > 0;
        const hasTakenPreAssessment =
          enrollmentData.assessmentResponses?.preAssessment?.length > 0 ||
          enrollmentData.progress?.assessments?.some(
            (a: any) => a.assessmentType === "pre"
          );

        if (hasPreAssessment && !hasTakenPreAssessment) {
          setShowPreAssessment(true);
          return;
        }

        // Check if final exam is in progress
        if (enrollmentData.finalExam?.attempts?.length > 0) {
          const lastAttempt =
            enrollmentData.finalExam.attempts[
              enrollmentData.finalExam.attempts.length - 1
            ];
          if (lastAttempt.startedAt && !lastAttempt.submittedAt) {
            const timeElapsed = Math.floor(
              (new Date().getTime() -
                new Date(lastAttempt.startedAt).getTime()) /
                1000 /
                60
            );
            const timeLeft = courseData.finalExam.duration - timeElapsed;
            if (timeLeft > 0) {
              setExamTimeLeft(timeLeft);
              setExamInProgress(true);
              startExamTimer(timeLeft);
              setShowFinalExam(true);
              return;
            }
          }
        }

        // Check if post-assessment needs to be shown
        const hasPostAssessment =
          courseData.assessment?.postAssessment?.length > 0;
        const hasTakenPostAssessment =
          enrollmentData.assessmentResponses?.postAssessment?.length > 0 ||
          enrollmentData.progress?.assessments?.some(
            (a: any) => a.assessmentType === "post"
          );
        const allModulesCompleted = courseData.modules.every((module: any) => {
          const modProgress = enrollmentData.progress?.modules?.find(
            (m: any) => m.moduleId === module._id
          );
          return modProgress?.status === "completed";
        });
        const finalExamPassed = enrollmentData.finalExam?.passed;

        if (
          hasPostAssessment &&
          !hasTakenPostAssessment &&
          allModulesCompleted &&
          finalExamPassed
        ) {
          setShowPostAssessment(true);
          return;
        }

        // Normal course navigation
        if (enrollmentData.progress?.currentModule && courseData.modules) {
          const moduleIndex = courseData.modules.findIndex(
            (m: any) => m._id === enrollmentData.progress.currentModule
          );
          if (moduleIndex >= 0) {
            setActiveModuleIndex(moduleIndex);
            if (enrollmentData.progress.currentSection) {
              const sectionIndex = courseData.modules[
                moduleIndex
              ].sections.findIndex(
                (s: any) => s._id === enrollmentData.progress.currentSection
              );
              if (sectionIndex >= 0) setActiveSectionIndex(sectionIndex);
            }
          }
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load course data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  useEffect(() => {
    if (!course?.modules || !enrollment) return;

    const trackTime = async () => {
      try {
        const currentModule = course.modules[activeModuleIndex];
        if (!currentModule?.sections) return;

        const currentSection = currentModule.sections[activeSectionIndex];
        if (currentSection) {
          await updateProgress(currentModule._id, currentSection._id, 30);
        }
      } catch (error) {
        console.error("Error tracking time:", error);
      }
    };

    const interval = setInterval(trackTime, 30000);
    setTimeSpentInterval(interval);

    return () => {
      clearInterval(interval);
      if (examTimerRef.current) clearInterval(examTimerRef.current);
    };
  }, [course, enrollment, activeModuleIndex, activeSectionIndex]);

  const submitPreAssessment = async () => {
    if (!course?.assessment?.preAssessment || !enrollment) return;

    try {
      const responses = course.assessment.preAssessment.map((question) => ({
        questionId: question._id,
        questionText: question.questionText,
        response: preAssessmentAnswers[question._id] || "",
        correctAnswer: question.correctAnswer,
        isCorrect:
          question.correctAnswer === preAssessmentAnswers[question._id],
      }));

      const token = localStorage.getItem("token") || "";
      const response = await fetch(
        `${baseUrl}/api/enrollment/${enrollment._id}/assessments/pre`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ responses }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit pre-assessment");
      }

      const updatedEnrollment = await response.json();
      setEnrollment(updatedEnrollment);
      setPreAssessmentAnswers({});
      setShowPreAssessment(false);
      toast.success("Pre-assessment submitted successfully!");
    } catch (error) {
      console.error("Error submitting pre-assessment:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit pre-assessment"
      );
    }
  };

  const submitPostAssessment = async () => {
    if (!course?.assessment?.postAssessment || !enrollment) return;

    try {
      const responses = course.assessment.postAssessment.map((question) => ({
        questionId: question._id,
        questionText: question.questionText,
        response: postAssessmentAnswers[question._id] || "",
        correctAnswer: question.correctAnswer,
        isCorrect:
          question.correctAnswer === postAssessmentAnswers[question._id],
      }));

      const token = localStorage.getItem("token") || "";
      const response = await fetch(
        `${baseUrl}/api/enrollment/${enrollment._id}/assessments/post`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ responses }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to submit post-assessment"
        );
      }

      const updatedEnrollment = await response.json();
      setEnrollment(updatedEnrollment);
      setPostAssessmentAnswers({});
      setShowPostAssessment(false);
      toast.success("Post-assessment submitted successfully!");
    } catch (error) {
      console.error("Error submitting post-assessment:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit post-assessment"
      );
    }
  };

  const updateProgress = async (
    moduleId: string,
    sectionId: string,
    timeSpent: number = 1
  ) => {
    try {
      if (!enrollment?._id) return;

      const token = localStorage.getItem("token") || "";
      const response = await fetch(
        `${baseUrl}/api/enrollment/${enrollment._id}/progress`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            moduleId,
            sectionId,
            timeSpent,
            markAsStarted: true,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to update progress (Status: ${response.status})`
        );
      }

      const updatedEnrollment = await response.json();
      setEnrollment(updatedEnrollment);
      return updatedEnrollment;
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update progress"
      );
      throw error;
    }
  };

  const markSectionComplete = async () => {
    try {
      setIsMarkingComplete(true);

      if (!course?.modules || !enrollment || !enrollment._id) {
        toast.error("Course data not loaded properly");
        return;
      }

      const currentModule = course.modules[activeModuleIndex];
      const currentSection = currentModule?.sections?.[activeSectionIndex];

      if (!currentModule || !currentSection) {
        toast.error("Module or section not found");
        return;
      }

      // For quiz sections, check if quiz is passed
      if (currentSection.type === "quiz") {
        const quizAssessment = enrollment.progress.assessments?.find(
          (a: any) =>
            a.sectionId === currentSection._id && a.assessmentType === "quiz"
        );

        if (!quizAssessment?.passed) {
          toast.error(
            "You must pass the quiz before marking this section complete"
          );
          return;
        }
      }

      const token = localStorage.getItem("token") || "";
      const response = await fetch(
        `${baseUrl}/api/enrollment/${enrollment._id}/complete-section`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            moduleId: currentModule._id,
            sectionId: currentSection._id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to mark section complete (Status: ${response.status})`
        );
      }

      const updatedEnrollment = await response.json();
      setEnrollment(updatedEnrollment);

      // Check if this was the last section in the module
      const isLastSectionInModule =
        activeSectionIndex === currentModule.sections.length - 1;
      const isLastModule = activeModuleIndex === course.modules.length - 1;

      // Navigate to next section or module if completed
      if (isLastSectionInModule) {
        if (!isLastModule) {
          // Move to first section of next module
          setActiveModuleIndex(activeModuleIndex + 1);
          setActiveSectionIndex(0);
          const nextModule = course.modules[activeModuleIndex + 1];
          const nextSection = nextModule.sections[0];
          await updateProgress(nextModule._id, nextSection._id);
        } else if (course.finalExam && !updatedEnrollment.finalExam?.passed) {
          // Show final exam if this was the last module
          setShowFinalExam(true);
        } else if (updatedEnrollment.currentStatus === "completed") {
          toast.success("Congratulations! You've completed the course.");
        }
      } else {
        // Move to next section in current module
        setActiveSectionIndex(activeSectionIndex + 1);
        const nextSection = currentModule.sections[activeSectionIndex + 1];
        await updateProgress(currentModule._id, nextSection._id);
      }

      toast.success("Section marked as completed!");
    } catch (error) {
      console.error("Error marking section complete:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to mark section complete"
      );
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const addSectionNote = async () => {
    if (!sectionNotes.trim() || !enrollment) return;

    try {
      const token = localStorage.getItem("token") || "";
      const currentModule = course?.modules?.[activeModuleIndex];
      const currentSection = currentModule?.sections?.[activeSectionIndex];

      if (!currentModule || !currentSection) {
        throw new Error("Module or section not found");
      }

      const response = await fetch(
        `${baseUrl}/api/enrollment/${enrollment._id}/add-note`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            moduleId: currentModule._id,
            sectionId: currentSection._id,
            note: sectionNotes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add note");
      }

      const updatedEnrollment = await response.json();
      setEnrollment(updatedEnrollment);
      setSectionNotes("");
      toast.success("Note added successfully!");
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add note"
      );
    }
  };

  const getModuleProgress = (moduleId: string) => {
    if (!enrollment?.progress?.modules) return null;
    return enrollment.progress.modules.find((m) => m.moduleId === moduleId);
  };

  const getSectionProgress = (moduleId: string, sectionId: string) => {
    const moduleProgress = getModuleProgress(moduleId);
    if (!moduleProgress?.sections) return null;
    return moduleProgress.sections.find((s) => s.sectionId === sectionId);
  };

  const getSectionNotes = (moduleId: string, sectionId: string) => {
    const sectionProgress = getSectionProgress(moduleId, sectionId);
    return sectionProgress?.notes || [];
  };

  const isSectionCompleted = (moduleId: string, sectionId: string) => {
    const sectionProgress = getSectionProgress(moduleId, sectionId);
    return sectionProgress?.status === "completed";
  };

  const handleVideoProgress = () => {
    if (videoRef.current) {
      const progress =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(progress);

      if (videoRef.current.currentTime % 10 < 0.1) {
        const currentModule = course?.modules?.[activeModuleIndex];
        const currentSection = currentModule?.sections?.[activeSectionIndex];
        if (currentModule && currentSection) {
          updateProgress(currentModule._id, currentSection._id, 10);
        }
      }
    }
  };

  const handleQuizAnswer = (
    questionIndex: number,
    answerIndex: number,
    isMultiple: boolean
  ) => {
    setQuizAnswers((prev) => {
      const newAnswers = { ...prev };
      if (isMultiple) {
        newAnswers[questionIndex] = newAnswers[questionIndex] || [];
        if (newAnswers[questionIndex].includes(answerIndex)) {
          newAnswers[questionIndex] = newAnswers[questionIndex].filter(
            (a) => a !== answerIndex
          );
        } else {
          newAnswers[questionIndex] = [
            ...newAnswers[questionIndex],
            answerIndex,
          ];
        }
      } else {
        newAnswers[questionIndex] = [answerIndex];
      }
      return newAnswers;
    });
  };

  const submitQuiz = async () => {
    if (!course || !enrollment) return;

    try {
      const token = localStorage.getItem("token") || "";
      const currentModule = course.modules[activeModuleIndex];
      const currentSection = currentModule.sections[activeSectionIndex];

      const response = await fetch(
        `${baseUrl}/api/enrollment/${enrollment._id}/submit-quiz`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            moduleId: currentModule._id,
            sectionId: currentSection._id,
            quizId: currentSection.quiz?._id,
            answers: quizAnswers,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit quiz");
      }

      const updatedEnrollment = await response.json();
      setEnrollment(updatedEnrollment);
      setQuizAnswers({});

      toast.success("Quiz submitted successfully!");

      const assessment = updatedEnrollment.progress.assessments?.find(
        (a: any) =>
          a.sectionId === currentSection._id && a.assessmentType === "quiz"
      );

      if (assessment?.passed) {
        await markSectionComplete();
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast(error instanceof Error ? error.message : "Failed to submit quiz");
    }
  };

  const startFinalExam = async () => {
    if (!course?.finalExam || !enrollment) return;

    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetch(
        `${baseUrl}/api/enrollment/${enrollment._id}/start-final-exam`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to start final exam");
      }

      const updatedEnrollment = await response.json();
      setEnrollment(updatedEnrollment);
      setExamInProgress(true);
      setExamTimeLeft(course.finalExam.duration);
      startExamTimer(course.finalExam.duration);

      toast.message(
        `You have ${course.finalExam.duration} minutes to complete the exam. Good luck!`
      );
    } catch (error) {
      console.error("Error starting final exam:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to start final exam"
      );
    }
  };

  const startExamTimer = (minutes: number) => {
    if (examTimerRef.current) clearInterval(examTimerRef.current);

    let timeLeft = minutes * 60;
    examTimerRef.current = setInterval(() => {
      timeLeft -= 1;
      setExamTimeLeft(Math.floor(timeLeft / 60));

      if (timeLeft <= 0) {
        if (examTimerRef.current) clearInterval(examTimerRef.current);
        submitFinalExam();
      }
    }, 1000);
  };

  const submitFinalExam = async () => {
    if (!course?.finalExam || !enrollment || !examInProgress) return;

    try {
      if (examTimerRef.current) clearInterval(examTimerRef.current);

      const token = localStorage.getItem("token") || "";
      const response = await fetch(
        `${baseUrl}/api/enrollment/${enrollment._id}/submit-final-exam`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            answers: examAnswers,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit final exam");
      }

      const updatedEnrollment = await response.json();
      setEnrollment(updatedEnrollment);
      setExamInProgress(false);
      setShowFinalExam(false);
      setExamAnswers({});

      if (updatedEnrollment.finalExam?.passed) {
        toast.success("You passed the final exam and completed the course!");
      } else if (updatedEnrollment.finalExam?.attempts?.length >= 3) {
        toast.message("You've used all your attempts. Please contact support.");
      } else {
        toast.message("You didn't pass this time. You can try again.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit final exam"
      );
    }
  };

  const navigateToSection = (moduleIndex: number, sectionIndex: number) => {
    if (!course?.modules?.[moduleIndex]?.sections?.[sectionIndex]) {
      toast.error("Invalid section navigation");
      return;
    }

    setActiveModuleIndex(moduleIndex);
    setActiveSectionIndex(sectionIndex);
    setShowFinalExam(false);

    const module = course.modules[moduleIndex];
    const section = module.sections[sectionIndex];
    updateProgress(module._id, section._id, 0);
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "pdf":
        return <File className="h-4 w-4" />;
      case "quiz":
        return <ListChecks className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs > 0 ? `${hrs}h ` : ""}${mins}m`;
  };

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
    );
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
              <Button onClick={() => router.push("/student/my-courses")}>
                Back to My Courses
              </Button>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (showPreAssessment) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <StudentSidebar />
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <Button
                variant="ghost"
                onClick={() => router.push("/student/courses")}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to My Courses
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ListChecks className="h-5 w-5" />
                    Pre-Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground">
                    Please complete this pre-assessment to help us understand
                    your current knowledge level.
                  </p>

                  {course.assessment?.preAssessment?.map((question) => (
                    <div key={question._id} className="space-y-3">
                      <p className="font-medium">{question.questionText}</p>
                      <div className="space-y-2 pl-4">
                        {question.type === "mcq" &&
                          question.options.map((option, i) => (
                            <div
                              key={i}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="radio"
                                id={`pre-q-${question._id}-o${i}`}
                                name={`pre-q-${question._id}`}
                                checked={
                                  preAssessmentAnswers[question._id] === option
                                }
                                onChange={() =>
                                  setPreAssessmentAnswers((prev) => ({
                                    ...prev,
                                    [question._id]: option,
                                  }))
                                }
                              />
                              <label
                                htmlFor={`pre-q-${question._id}-o${i}`}
                                className="text-sm"
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        {question.type === "shortAnswer" && (
                          <textarea
                            className="w-full p-2 border rounded-md text-sm"
                            rows={3}
                            value={preAssessmentAnswers[question._id] || ""}
                            onChange={(e) =>
                              setPreAssessmentAnswers((prev) => ({
                                ...prev,
                                [question._id]: e.target.value,
                              }))
                            }
                            placeholder="Type your answer here..."
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={submitPreAssessment}
                      disabled={
                        Object.keys(preAssessmentAnswers).length <
                        (course.assessment?.preAssessment?.length ?? 0)
                      }
                    >
                      Submit Pre-Assessment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (showPostAssessment) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <StudentSidebar />
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <Button
                variant="ghost"
                onClick={() => router.push("/student/courses")}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to My Courses
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ListChecks className="h-5 w-5" />
                    Post-Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground">
                    Please complete this post-assessment to help us evaluate
                    your learning progress.
                  </p>

                  {course.assessment?.postAssessment?.map((question, index) => (
                    <div key={`post-q-${question._id}`} className="space-y-3">
                      <p className="font-medium">
                        {index + 1}. {question.questionText}
                      </p>
                      <div className="space-y-2 pl-4">
                        {question.type === "mcq" &&
                          question.options?.map((option, i) => (
                            <div
                              key={`post-q-${question._id}-o${i}`}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="radio"
                                id={`post-q-${question._id}-o${i}`}
                                name={`post-q-${question._id}`}
                                checked={
                                  postAssessmentAnswers[question._id] === option
                                }
                                onChange={() =>
                                  setPostAssessmentAnswers((prev) => ({
                                    ...prev,
                                    [question._id]: option,
                                  }))
                                }
                              />
                              <label
                                htmlFor={`post-q-${question._id}-o${i}`}
                                className="text-sm"
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        {question.type === "shortAnswer" && (
                          <textarea
                            className="w-full p-2 border rounded-md text-sm"
                            rows={3}
                            value={postAssessmentAnswers[question._id] || ""}
                            onChange={(e) =>
                              setPostAssessmentAnswers((prev) => ({
                                ...prev,
                                [question._id]: e.target.value,
                              }))
                            }
                            placeholder="Type your answer here..."
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={submitPostAssessment}
                      disabled={
                        Object.keys(postAssessmentAnswers).length <
                        (course.assessment?.postAssessment?.length ?? 0)
                      }
                    >
                      Submit Post-Assessment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  const currentModule = course.modules?.[activeModuleIndex];
  const currentSection = currentModule?.sections?.[activeSectionIndex];

  if (!currentModule || !currentSection) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <StudentSidebar />
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h1 className="text-lg font-semibold">
                  Course Content Not Available
                </h1>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <Button onClick={() => router.push("/student/my-courses")}>
                Back to My Courses
              </Button>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  const moduleProgress = getModuleProgress(currentModule._id);
  const sectionProgress = getSectionProgress(
    currentModule._id,
    currentSection._id
  );
  const sectionNotesList = getSectionNotes(
    currentModule._id,
    currentSection._id
  );
  const isCourseCompleted = enrollment.currentStatus === "completed";
  const allModulesCompleted = course.modules.every(
    (module) => getModuleProgress(module._id)?.status === "completed"
  );
  const finalExamPassed = enrollment.finalExam?.passed;
  const finalExamAttempts = enrollment.finalExam?.attempts?.length || 0;
  const maxExamAttempts = 3;

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <StudentSidebar />
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <Button
              variant="ghost"
              onClick={() => router.push("/student/courses")}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to My Courses
            </Button>
            <div className="flex items-center gap-4">
              <Badge
                variant={
                  enrollment.currentStatus === "completed"
                    ? "default"
                    : enrollment.currentStatus === "in_progress"
                    ? "secondary"
                    : "outline"
                }
                className="capitalize"
              >
                {enrollment.currentStatus?.replace("_", " ") || "Loading..."}
              </Badge>
              {enrollment.certification?.eligible && (
                <Badge
                  variant={
                    enrollment.certification.issued ? "default" : "secondary"
                  }
                >
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
                <Progress
                  value={enrollment?.progress?.completionPercentage || 0}
                  className="h-2 w-32"
                />
                <span className="text-sm">
                  {Math.round(enrollment?.progress?.completionPercentage || 0)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="hidden md:block w-72 border-r overflow-y-auto">
              <div className="p-4">
                <h2 className="font-semibold text-lg mb-2">{course.title}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={course.tutor?.avatar} />
                    <AvatarFallback>
                      {course.tutor?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{course.tutor?.name}</span>
                </div>

                <div className="space-y-3 mt-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p>{course.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Level</p>
                    <p>{course.level}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(course.estimatedDuration)}</span>
                    </div>
                  </div>
                  {course.deadline && (
                    <div>
                      <p className="text-muted-foreground">Deadline</p>
                      <p>{new Date(course.deadline).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <p className="text-sm text-muted-foreground">
                  {course.description}
                </p>
              </div>

              <div className="space-y-2 px-2">
                {course.modules.map((module, moduleIndex) => {
                  const modProgress = getModuleProgress(module._id);
                  return (
                    <div key={`module-${module._id}`} className="space-y-1">
                      <div
                        className={`p-2 rounded-md font-medium cursor-pointer flex items-center justify-between ${
                          activeModuleIndex === moduleIndex && !showFinalExam
                            ? "bg-secondary"
                            : "hover:bg-secondary/50"
                        }`}
                        onClick={() => {
                          setActiveModuleIndex(moduleIndex);
                          setActiveSectionIndex(0);
                          setShowFinalExam(false);
                          updateProgress(module._id, module.sections[0]._id);
                        }}
                      >
                        <span>{module.title}</span>
                        {modProgress?.status === "completed" && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <div className="pl-4 space-y-1">
                        {module.sections.map((section, sectionIndex) => {
                          const sectProgress = getSectionProgress(
                            module._id,
                            section._id
                          );
                          return (
                            <div
                              key={`section-${section._id}`}
                              className={`p-2 text-sm rounded-md flex items-center gap-2 cursor-pointer ${
                                activeModuleIndex === moduleIndex &&
                                activeSectionIndex === sectionIndex &&
                                !showFinalExam
                                  ? "bg-primary/10 text-primary"
                                  : "hover:bg-secondary/30"
                              }`}
                              onClick={() =>
                                navigateToSection(moduleIndex, sectionIndex)
                              }
                            >
                              {getSectionIcon(section.type)}
                              <span className="truncate">{section.title}</span>
                              {sectProgress?.status === "completed" ||
                              isCourseCompleted ? (
                                <CheckCircle className="h-4 w-4 ml-auto text-green-500" />
                              ) : sectProgress?.status === "in_progress" ? (
                                <div className="h-2 w-2 ml-auto rounded-full bg-blue-500"></div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {course.finalExam && (
                  <div className="space-y-1 mt-4">
                    <div
                      className={`p-2 rounded-md font-medium cursor-pointer flex items-center justify-between ${
                        showFinalExam ? "bg-secondary" : "hover:bg-secondary/50"
                      }`}
                      onClick={() => {
                        if (
                          allModulesCompleted ||
                          (enrollment.finalExam?.attempts?.length ?? 0) > 0
                        ) {
                          setShowFinalExam(true);
                        }
                      }}
                    >
                      <span>Final Exam</span>
                      {finalExamPassed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (enrollment.finalExam?.attempts?.length ?? 0) > 0 ? (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      ) : null}
                    </div>
                    {(enrollment.finalExam?.attempts?.length ?? 0) > 0 && (
                      <div className="pl-4 text-sm text-muted-foreground">
                        Attempts: {finalExamAttempts}/{maxExamAttempts}
                        {enrollment.finalExam?.bestScore !== undefined && (
                          <div>
                            Best Score: {enrollment.finalExam?.bestScore}%
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 max-w-4xl mx-auto">
                {showFinalExam && course.finalExam ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-bold">Final Exam</h1>
                        <p className="text-muted-foreground">
                          {course.finalExam.description}
                        </p>
                      </div>
                      {examInProgress && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-md">
                          <Timer className="h-5 w-5" />
                          <span className="font-medium">
                            Time Remaining: {Math.floor(examTimeLeft)}:
                            {String(
                              Math.round((examTimeLeft % 1) * 60)
                            ).padStart(2, "0")}
                          </span>
                        </div>
                      )}
                    </div>

                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <ListChecks className="h-4 w-4" />
                          <CardTitle>Exam Details</CardTitle>
                          {finalExamPassed && (
                            <Badge className="ml-auto" variant="secondary">
                              Passed
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Duration
                            </p>
                            <p>{course.finalExam.duration} minutes</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Passing Score
                            </p>
                            <p>{course.finalExam.passingScore}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Attempts
                            </p>
                            <p>
                              {finalExamAttempts}/{maxExamAttempts}
                            </p>
                          </div>
                          {enrollment.finalExam?.bestScore !== undefined && (
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Best Score
                              </p>
                              <p>{enrollment.finalExam.bestScore}%</p>
                            </div>
                          )}
                        </div>

                        {!examInProgress &&
                          !finalExamPassed &&
                          finalExamAttempts < maxExamAttempts && (
                            <Button onClick={startFinalExam} className="mt-4">
                              Start Final Exam
                            </Button>
                          )}

                        {examInProgress && (
                          <>
                            <Separator className="my-4" />

                            <div className="space-y-6">
                              {course.finalExam.questions.map(
                                (question, index) => (
                                  <div
                                    key={`question-${question._id}`}
                                    className="space-y-3"
                                  >
                                    <p className="font-medium">
                                      {index + 1}. {question.questionText}
                                    </p>
                                    <div className="space-y-2 pl-4">
                                      {question.options.map((option, i) => (
                                        <div
                                          key={`option-${i}`}
                                          className="flex items-center space-x-2"
                                        >
                                          <input
                                            type="radio"
                                            id={`q${question._id}-o${i}`}
                                            name={`question-${question._id}`}
                                            checked={
                                              examAnswers[question._id] ===
                                              option
                                            }
                                            onChange={() =>
                                              setExamAnswers((prev) => ({
                                                ...prev,
                                                [question._id]: option,
                                              }))
                                            }
                                            disabled={!examInProgress}
                                          />
                                          <label
                                            htmlFor={`q${question._id}-o${i}`}
                                            className="text-sm"
                                          >
                                            {option}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>

                            <div className="flex justify-between mt-6">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  if (
                                    confirm(
                                      "Are you sure you want to exit the exam? Your progress will be saved."
                                    )
                                  ) {
                                    setExamInProgress(false);
                                  }
                                }}
                              >
                                Save & Exit
                              </Button>
                              <Button
                                onClick={submitFinalExam}
                                disabled={
                                  Object.keys(examAnswers).length <
                                  course.finalExam.questions.length
                                }
                              >
                                Submit Exam
                              </Button>
                            </div>
                          </>
                        )}

                        {!examInProgress &&
                          (enrollment.finalExam?.attempts?.length ?? 0) > 0 && (
                            <div className="mt-6 space-y-4">
                              <h4 className="font-medium">
                                Previous Attempt Results
                              </h4>
                              {enrollment.finalExam?.attempts
                                ?.filter((attempt) => attempt.submittedAt)
                                ?.map((attempt, idx) => (
                                  <div
                                    key={`attempt-${idx}`}
                                    className="p-4 border rounded-lg"
                                  >
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <p className="font-medium">
                                          Attempt {attempt.attemptNumber}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          {attempt.submittedAt
                                            ? new Date(
                                                attempt.submittedAt
                                              ).toLocaleString()
                                            : "N/A"}
                                        </p>
                                      </div>
                                      <Badge
                                        variant={
                                          attempt.passed
                                            ? "default"
                                            : "destructive"
                                        }
                                      >
                                        {attempt.score}% -{" "}
                                        {attempt.passed ? "Passed" : "Failed"}
                                      </Badge>
                                    </div>
                                    {attempt.feedback && (
                                      <p className="mt-2 text-sm">
                                        {attempt.feedback}
                                      </p>
                                    )}
                                  </div>
                                ))}
                            </div>
                          )}
                      </CardContent>
                    </Card>

                    {!examInProgress &&
                      !finalExamPassed &&
                      finalExamAttempts > 0 && (
                        <Button
                          variant="outline"
                          onClick={() => setShowFinalExam(false)}
                          className="mt-4"
                        >
                          Back to Course Content
                        </Button>
                      )}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h1 className="text-2xl font-bold">
                          {currentModule.title}
                        </h1>
                        <h2 className="text-xl font-semibold mt-2">
                          {currentSection.title}
                        </h2>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{course.tutor.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BarChart2 className="h-4 w-4" />
                            <span>
                              {Math.round(
                                enrollment?.progress?.completionPercentage || 0
                              )}
                              % complete
                            </span>
                          </div>
                          {(sectionProgress?.timeSpent ?? 0) > 0 && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {sectionProgress
                                  ? Math.floor(sectionProgress.timeSpent / 60)
                                  : 0}{" "}
                                min spent
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            activeSectionIndex === 0 && activeModuleIndex === 0
                          }
                          onClick={() => {
                            if (activeSectionIndex > 0) {
                              setActiveSectionIndex(activeSectionIndex - 1);
                            } else if (activeModuleIndex > 0) {
                              setActiveModuleIndex(activeModuleIndex - 1);
                              setActiveSectionIndex(
                                course.modules[activeModuleIndex - 1].sections
                                  .length - 1
                              );
                            }
                          }}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            activeSectionIndex ===
                              currentModule.sections.length - 1 &&
                            activeModuleIndex === course.modules.length - 1
                          }
                          onClick={() => {
                            const nextSectionIndex = activeSectionIndex + 1;
                            const nextModuleIndex =
                              activeModuleIndex +
                              (nextSectionIndex >= currentModule.sections.length
                                ? 1
                                : 0);
                            const actualNextSectionIndex =
                              nextSectionIndex >= currentModule.sections.length
                                ? 0
                                : nextSectionIndex;

                            if (nextModuleIndex < course.modules.length) {
                              const nextModule =
                                course.modules[nextModuleIndex];
                              const nextSection =
                                nextModule.sections[actualNextSectionIndex];

                              if (
                                isSectionCompleted(
                                  currentModule._id,
                                  currentSection._id
                                )
                              ) {
                                setActiveModuleIndex(nextModuleIndex);
                                setActiveSectionIndex(actualNextSectionIndex);
                                updateProgress(nextModule._id, nextSection._id);
                              } else {
                                toast.message(
                                  "Please complete the current section before moving to the next one."
                                );
                              }
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
                          <CardTitle className="capitalize">
                            {currentSection.type} Content
                          </CardTitle>
                          {sectionProgress?.status === "completed" && (
                            <Badge className="ml-auto" variant="secondary">
                              Completed
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {currentSection.type === "text" && (
                          <>
                            <div
                              className="prose max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: currentSection.content || "",
                              }}
                            />
                            {!isSectionCompleted(
                              currentModule._id,
                              currentSection._id
                            ) && (
                              <Button
                                onClick={markSectionComplete}
                                disabled={isMarkingComplete}
                                className="mt-4"
                              >
                                {isMarkingComplete
                                  ? "Marking..."
                                  : "Mark as Complete"}
                              </Button>
                            )}
                          </>
                        )}

                        {currentSection.type === "video" && (
                          <div className="space-y-4">
                            <div className="aspect-video w-full bg-black rounded-md overflow-hidden">
                              <video
                                ref={videoRef}
                                controls
                                className="w-full h-full"
                                src={`${baseUrl}${currentSection.videoUrl}`}
                                onTimeUpdate={handleVideoProgress}
                              />
                            </div>
                            <Progress value={videoProgress} className="h-2" />
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>{Math.round(videoProgress)}% watched</span>
                            </div>
                            {!isSectionCompleted(
                              currentModule._id,
                              currentSection._id
                            ) && (
                              <Button
                                onClick={markSectionComplete}
                                disabled={isMarkingComplete}
                                className="mt-4"
                              >
                                {isMarkingComplete
                                  ? "Marking..."
                                  : "Mark as Complete"}
                              </Button>
                            )}
                          </div>
                        )}

                        {currentSection.type === "pdf" && (
                          <div className="space-y-4">
                            <div className="h-[600px]">
                              <iframe
                                src={`${baseUrl}${currentSection.pdfUrl}`}
                                className="w-full h-full border rounded-md"
                                title={currentSection.title}
                              />
                            </div>
                            {!isSectionCompleted(
                              currentModule._id,
                              currentSection._id
                            ) && (
                              <Button
                                onClick={markSectionComplete}
                                disabled={isMarkingComplete}
                                className="mt-4"
                              >
                                {isMarkingComplete
                                  ? "Marking..."
                                  : "Mark as Complete"}
                              </Button>
                            )}
                          </div>
                        )}

                        {currentSection.type === "quiz" && (
                          <div className="space-y-6">
                            <div className="space-y-2">
                              {currentSection.quiz && (
                                <h3 className="text-lg font-semibold">
                                  {currentSection.quiz?.title}
                                </h3>
                              )}
                              <p className="text-sm text-muted-foreground">
                                Duration: {currentSection.quiz?.duration}{" "}
                                minutes
                              </p>
                            </div>
                            <div className="space-y-8">
                              {currentSection.quiz?.questions.map(
                                (question, index) => (
                                  <div
                                    key={`question-${index}`}
                                    className="space-y-3"
                                  >
                                    <p className="font-medium">
                                      {index + 1}. {question.questionText}
                                    </p>
                                    <div className="space-y-2 pl-4">
                                      {question.options.map((option, i) => (
                                        <div
                                          key={`option-${i}`}
                                          className="flex items-center space-x-2"
                                        >
                                          <input
                                            type={
                                              question.questionType ===
                                              "multiple"
                                                ? "checkbox"
                                                : "radio"
                                            }
                                            id={`q${index}-o${i}`}
                                            name={`question-${index}`}
                                            checked={
                                              quizAnswers[index]?.includes(i) ||
                                              false
                                            }
                                            onChange={() =>
                                              handleQuizAnswer(
                                                index,
                                                i,
                                                question.questionType ===
                                                  "multiple"
                                              )
                                            }
                                          />
                                          <label
                                            htmlFor={`q${index}-o${i}`}
                                            className="text-sm"
                                          >
                                            {option}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                            <Button
                              onClick={submitQuiz}
                              disabled={
                                Object.keys(quizAnswers).length === 0 ||
                                isMarkingComplete
                              }
                            >
                              {isMarkingComplete
                                ? "Submitting..."
                                : "Submit Quiz"}
                            </Button>
                          </div>
                        )}
                      </CardContent>

                      {sectionNotesList.length > 0 && (
                        <CardFooter className="border-t pt-4">
                          <div className="w-full space-y-4">
                            <h4 className="font-medium">Your Notes</h4>
                            <div className="space-y-3">
                              {sectionNotesList.map((note, index) => (
                                <div
                                  key={`note-${index}`}
                                  className="p-3 bg-secondary/30 rounded-md text-sm"
                                >
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
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
