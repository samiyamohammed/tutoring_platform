"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  Film,
  LayoutDashboard,
  ListChecks,
  Lock,
  PlayCircle,
  Star,
  Users,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StudentSidebar } from "@/components/student-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface Module {
  _id: string;
  title: string;
  description: string;
  order: number;
  sections: Section[];
  isLocked: boolean;
}

interface Section {
  _id: string;
  title: string;
  order: number;
  content: Content[];
  isCompleted: boolean;
}

interface Content {
  _id: string;
  type: "video" | "text" | "quiz" | "file";
  title: string;
  duration?: number; // in minutes
  content?: string; // for text content
  videoUrl?: string; // for video content
  fileUrl?: string; // for file content
  isCompleted: boolean;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  image?: string;
  tutor: {
    _id: string;
    name: string;
    avatar?: string;
  };
  currentEnrollment: number;
  rating: number;
  reviews: number;
  progress: number;
  modules: Module[];
}

export default function CourseContentPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeContent, setActiveContent] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") || ""
            : "";
        const response = await fetch(
          `http://localhost:5000/api/course/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch course");

        const data = await response.json();
        setCourse(data);

        // Expand the first module by default
        if (data.modules.length > 0) {
          setExpandedModules({ [data.modules[0]._id]: true });
          setActiveModule(data.modules[0]._id);
          if (data.modules[0].sections.length > 0) {
            setActiveSection(data.modules[0].sections[0]._id);
            if (data.modules[0].sections[0].content.length > 0) {
              setActiveContent(data.modules[0].sections[0].content[0]._id);
            }
          }
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to fetch course",
        });
        router.push("/student/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, router, toast]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const markAsCompleted = async (contentId: string) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || ""
          : "";
      const response = await fetch(
        `http://localhost:5000/api/course/${courseId}/progress`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ contentId }),
        }
      );

      if (!response.ok) throw new Error("Failed to update progress");

      const updatedCourse = await response.json();
      setCourse(updatedCourse);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update progress",
      });
    }
  };

  if (loading || !course) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <StudentSidebar />
          <main className="flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h1 className="text-lg font-semibold">Loading Course...</h1>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  const currentContent = course.modules
    .flatMap((module) => module.sections)
    .flatMap((section) => section.content)
    .find((content) => content._id === activeContent);

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <StudentSidebar />
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">{course.title}</h1>
              <p className="text-sm text-muted-foreground">
                Learning Dashboard
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={course.progress} className="w-32 h-2" />
              <span className="text-sm font-medium">
                {Math.round(course.progress)}% complete
              </span>
            </div>
          </div>
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar with course modules */}
            <div className="w-64 border-r overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={course.tutor?.avatar}
                      alt={course.tutor?.name}
                    />
                    <AvatarFallback>
                      {course.tutor?.name?.charAt(0) || "T"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{course.tutor?.name}</p>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      <span className="text-xs ml-1">{course.rating}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({course.reviews})
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full mb-4" asChild>
                  <Link href={`/student/courses/${courseId}`}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Course Overview
                  </Link>
                </Button>
              </div>
              <nav className="space-y-1 px-2">
                {course.modules.map((module) => (
                  <div key={module._id} className="space-y-1">
                    <button
                      onClick={() => toggleModule(module._id)}
                      className={`w-full flex items-center justify-between p-2 rounded-md text-sm font-medium ${
                        activeModule === module._id
                          ? "bg-secondary"
                          : "hover:bg-secondary/50"
                      }`}
                      disabled={module.isLocked}
                    >
                      <div className="flex items-center">
                        {module.isLocked ? (
                          <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                        ) : expandedModules[module._id] ? (
                          <ChevronDown className="h-4 w-4 mr-2" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mr-2" />
                        )}
                        {module.title}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {module.sections.length} sections
                      </Badge>
                    </button>
                    {expandedModules[module._id] && !module.isLocked && (
                      <div className="ml-6 space-y-1">
                        {module.sections.map((section) => (
                          <div key={section._id} className="space-y-1">
                            <button
                              onClick={() => {
                                setActiveModule(module._id);
                                setActiveSection(section._id);
                                if (section.content.length > 0) {
                                  setActiveContent(section.content[0]._id);
                                }
                              }}
                              className={`w-full flex items-center justify-between p-2 rounded-md text-sm ${
                                activeSection === section._id
                                  ? "bg-accent"
                                  : "hover:bg-accent/50"
                              }`}
                            >
                              <div className="flex items-center">
                                {section.isCompleted ? (
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                ) : (
                                  <PlayCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                                )}
                                {section.title}
                              </div>
                            </button>
                            {activeSection === section._id && (
                              <div className="ml-4 space-y-1">
                                {section.content.map((content) => (
                                  <button
                                    key={content._id}
                                    onClick={() => {
                                      setActiveContent(content._id);
                                    }}
                                    className={`w-full flex items-center p-2 rounded-md text-xs ${
                                      activeContent === content._id
                                        ? "bg-primary/10"
                                        : "hover:bg-primary/5"
                                    }`}
                                  >
                                    <div className="flex items-center">
                                      {content.isCompleted ? (
                                        <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                                      ) : (
                                        <div className="h-3 w-3 mr-2 flex items-center justify-center">
                                          {content.type === "video" && (
                                            <Film className="h-3 w-3 text-blue-500" />
                                          )}
                                          {content.type === "text" && (
                                            <FileText className="h-3 w-3 text-gray-500" />
                                          )}
                                          {content.type === "quiz" && (
                                            <ListChecks className="h-3 w-3 text-purple-500" />
                                          )}
                                          {content.type === "file" && (
                                            <FileText className="h-3 w-3 text-orange-500" />
                                          )}
                                        </div>
                                      )}
                                      {content.title}
                                      {content.duration && (
                                        <span className="text-xs text-muted-foreground ml-2">
                                          {content.duration} min
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            {/* Main content area */}
            <div className="flex-1 overflow-y-auto p-6">
              {currentContent ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {currentContent.title}
                      </h2>
                      <p className="text-muted-foreground">
                        {
                          course.modules.find((m) =>
                            m.sections.some((s) =>
                              s.content.some(
                                (c) => c._id === currentContent._id
                              )
                            )
                          )?.title
                        }
                        {" > "}
                        {
                          course.modules
                            .flatMap((m) => m.sections)
                            .find((s) =>
                              s.content.some(
                                (c) => c._id === currentContent._id
                              )
                            )?.title
                        }
                      </p>
                    </div>
                    {!currentContent.isCompleted && (
                      <Button
                        onClick={() => markAsCompleted(currentContent._id)}
                      >
                        Mark as Completed
                      </Button>
                    )}
                  </div>

                  <div className="rounded-lg border overflow-hidden">
                    {currentContent.type === "video" &&
                      currentContent.videoUrl && (
                        <div className="aspect-video bg-black">
                          <video
                            controls
                            className="w-full h-full"
                            src={currentContent.videoUrl}
                          />
                        </div>
                      )}
                    {currentContent.type === "text" && (
                      <Card>
                        <CardContent className="p-6 prose max-w-none">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: currentContent.content || "",
                            }}
                          />
                        </CardContent>
                      </Card>
                    )}
                    {currentContent.type === "quiz" && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Quiz: {currentContent.title}</CardTitle>
                          <CardDescription>
                            Test your knowledge from this section
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-secondary p-6 rounded-lg text-center">
                            <p className="text-lg">
                              Quiz content would be displayed here
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              This would include questions, multiple choice
                              options, and submission handling
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {currentContent.type === "file" &&
                      currentContent.fileUrl && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Downloadable Resource</CardTitle>
                            <CardDescription>
                              {currentContent.title}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Button asChild>
                              <a
                                href={currentContent.fileUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Download File
                              </a>
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      disabled={
                        !findPreviousContent(course, currentContent._id)
                      }
                      onClick={() => {
                        const prev = findPreviousContent(
                          course,
                          currentContent._id
                        );
                        if (prev) setActiveContent(prev._id);
                      }}
                    >
                      Previous
                    </Button>
                    <Button
                      disabled={!findNextContent(course, currentContent._id)}
                      onClick={() => {
                        const next = findNextContent(
                          course,
                          currentContent._id
                        );
                        if (next) setActiveContent(next._id);
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium">
                    Select a lesson to begin
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Choose a module and section from the sidebar to view its
                    content
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

function findPreviousContent(course: Course, currentContentId: string) {
  const allContents = course.modules.flatMap((m) =>
    m.sections.flatMap((s) => s.content)
  );
  const currentIndex = allContents.findIndex((c) => c._id === currentContentId);
  return currentIndex > 0 ? allContents[currentIndex - 1] : null;
}

function findNextContent(course: Course, currentContentId: string) {
  const allContents = course.modules.flatMap((m) =>
    m.sections.flatMap((s) => s.content)
  );
  const currentIndex = allContents.findIndex((c) => c._id === currentContentId);
  return currentIndex < allContents.length - 1
    ? allContents[currentIndex + 1]
    : null;
}
