"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  File,
  FileVideo,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { TutorSidebar } from "@/components/tutor-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB for video files
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"];
const ACCEPTED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const moduleSchema = z.object({
  title: z.string().min(1, { message: "Module title is required" }),
  description: z.string().min(1, { message: "Module description is required" }),
  lessons: z
    .array(
      z.object({
        title: z.string().min(1, { message: "Lesson title is required" }),
        content: z.string().min(1, { message: "Lesson content is required" }),
        videoUrl: z.string().optional(),
        documents: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
              type: z.string(),
              size: z.number(),
              url: z.string(),
            })
          )
          .optional(),
      })
    )
    .min(1, { message: "At least one lesson is required" }),
});

export default function CourseContentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modules, setModules] = useState([
    {
      id: "1",
      title: "",
      description: "",
      lessons: [
        {
          id: "1-1",
          title: "",
          content: "",
          videoUrl: "",
          documents: [],
        },
      ],
    },
  ]);
  const [currentModule, setCurrentModule] = useState("1");
  const [currentLesson, setCurrentLesson] = useState("1-1");
  const [activeTab, setActiveTab] = useState("text");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof moduleSchema>>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      title: "",
      description: "",
      lessons: [
        {
          title: "",
          content: "",
          videoUrl: "",
          documents: [],
        },
      ],
    },
  });

  const addModule = () => {
    const newId = (modules.length + 1).toString();
    const newModule = {
      id: newId,
      title: "",
      description: "",
      lessons: [
        {
          id: `${newId}-1`,
          title: "",
          content: "",
          videoUrl: "",
          documents: [],
        },
      ],
    };
    setModules([...modules, newModule]);
    setCurrentModule(newId);
    setCurrentLesson(`${newId}-1`);
  };

  const removeModule = (id: string) => {
    if (modules.length === 1) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must have at least one module",
      });
      return;
    }

    const updatedModules = modules.filter((m) => m.id !== id);
    setModules(updatedModules);

    if (currentModule === id) {
      setCurrentModule(updatedModules[0].id);
      setCurrentLesson(updatedModules[0].lessons[0].id);
    }
  };

  const addLesson = (moduleId: string) => {
    const updatedModules = modules.map((m) => {
      if (m.id === moduleId) {
        const newLessonId = `${moduleId}-${m.lessons.length + 1}`;
        return {
          ...m,
          lessons: [
            ...m.lessons,
            {
              id: newLessonId,
              title: "",
              content: "",
              videoUrl: "",
              documents: [],
            },
          ],
        };
      }
      return m;
    });

    setModules(updatedModules);

    const currentModule = getCurrentModule();
    const lessonCount = currentModule?.lessons?.length ?? 0;
    const newLessonId = `${moduleId}-${lessonCount + 1}`;
    setCurrentLesson(newLessonId);
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    const module = modules.find((m) => m.id === moduleId);

    if (!module) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Module not found.",
      });
      return;
    }

    if (module.lessons.length === 1) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must have at least one lesson per module",
      });
      return;
    }

    const updatedModules = modules.map((m) => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: m.lessons.filter((l) => l.id !== lessonId),
        };
      }
      return m;
    });

    setModules(updatedModules);

    if (currentLesson === lessonId) {
      const updatedModule = updatedModules.find((m) => m.id === moduleId);
      if (updatedModule && updatedModule.lessons.length > 0) {
        setCurrentLesson(updatedModule.lessons[0].id);
      } else {
        setCurrentLesson("");
      }
    }
  };

  const updateModule = (id: string, field: string, value: string) => {
    const updatedModules = modules.map((m) => {
      if (m.id === id) {
        return { ...m, [field]: value };
      }
      return m;
    });
    setModules(updatedModules);
  };

  const updateLesson = (
    moduleId: string,
    lessonId: string,
    field: string,
    value:
      | string
      | { id: string; name: any; type: any; size: any; url: string }[]
  ) => {
    const updatedModules = modules.map((m) => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: m.lessons.map((l) => {
            if (l.id === lessonId) {
              return { ...l, [field]: value };
            }
            return l;
          }),
        };
      }
      return m;
    });
    setModules(updatedModules);
  };

  const getCurrentModule = () => {
    return modules.find((m) => m.id === currentModule);
  };

  const getCurrentLesson = () => {
    const module = getCurrentModule();
    return module ? module.lessons.find((l) => l.id === currentLesson) : null;
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "File is too large. Maximum size is 100MB.",
      });
      return;
    }

    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Invalid file type. Accepted types are MP4, WebM, and OGG.",
      });
      return;
    }

    setIsUploading(true);

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);

        // In a real app, you would get the URL from your backend
        const videoUrl = URL.createObjectURL(file);
        updateLesson(currentModule, currentLesson, "videoUrl", videoUrl);

        toast({
          title: "Video uploaded successfully",
          description:
            "Your video has been uploaded and attached to the lesson.",
        });
      }
    }, 200);
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const invalidFiles = files.filter((file) => {
      return !ACCEPTED_DOCUMENT_TYPES.includes(file.type);
    });

    if (invalidFiles.length > 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Some files have invalid types. Accepted types are PDF, DOC, and DOCX.",
      });
      return;
    }

    const currentLessonData = getCurrentLesson();
    if (!currentLessonData) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No lesson selected to attach documents to.",
      });
      return;
    }

    const currentDocuments = currentLessonData.documents || [];

    const newDocuments = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
    }));

    updateLesson(currentModule, currentLessonData.id, "documents", [
      ...currentDocuments,
      ...newDocuments,
    ]);

    toast({
      title: "Documents uploaded successfully",
      description: `${files.length} document(s) have been attached to the lesson.`,
    });
  };

  const removeDocument = (documentId: string) => {
    const lesson = getCurrentLesson();
    if (!lesson) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No current lesson selected.",
      });
      return;
    }

    // Ensure the documents are of correct type
    const currentDocuments = (lesson?.documents || []) as { id: string }[];

    // Filter out the document by id
    const updatedDocuments = currentDocuments.filter(
      (doc) => doc.id !== documentId
    );

    // Assert that updatedDocuments matches the expected type
    updateLesson(
      currentModule,
      lesson.id,
      "documents",
      updatedDocuments as {
        id: string;
        name: string;
        type: string;
        size: number;
        url: string;
      }[]
    );
  };

  async function onSubmit(values: z.infer<typeof moduleSchema>) {
    setIsSubmitting(true);

    try {
      // Prepare the data with the current modules state
      const formData = {
        modules: modules,
      };

      // This would be replaced with actual API call
      console.log(formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Course content saved successfully",
        description: "Your course content has been saved.",
      });

      // Redirect back to course creation
      router.push("/tutor/create-course");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save course content. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <TutorSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">Create Course Content</h1>
              <p className="text-sm text-muted-foreground">
                Add modules and lessons to your course
              </p>
            </div>
          </div>
          <div className="flex-1 space-y-4 p-8 pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-4 md:grid-cols-[300px_1fr]">
                  <Card className="h-fit">
                    <CardHeader>
                      <CardTitle>Course Structure</CardTitle>
                      <CardDescription>
                        Organize your course content
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        {modules.map((module) => (
                          <div key={module.id} className="space-y-2">
                            <Button
                              variant={
                                currentModule === module.id
                                  ? "default"
                                  : "outline"
                              }
                              className="w-full justify-between"
                              onClick={() => {
                                setCurrentModule(module.id);
                                setCurrentLesson(module.lessons[0].id);
                              }}
                            >
                              <span className="truncate">
                                {module.title || `Module ${module.id}`}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeModule(module.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </Button>

                            {currentModule === module.id && (
                              <div className="ml-4 space-y-1 border-l pl-4">
                                {module.lessons.map((lesson) => (
                                  <Button
                                    key={lesson.id}
                                    variant={
                                      currentLesson === lesson.id
                                        ? "secondary"
                                        : "ghost"
                                    }
                                    className="w-full justify-between"
                                    onClick={() => setCurrentLesson(lesson.id)}
                                  >
                                    <span className="truncate">
                                      {lesson.title ||
                                        `Lesson ${lesson.id.split("-")[1]}`}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeLesson(module.id, lesson.id);
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </Button>
                                ))}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start"
                                  onClick={() => addLesson(module.id)}
                                >
                                  <Plus className="mr-2 h-3 w-3" />
                                  Add Lesson
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={addModule}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Module
                      </Button>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    {getCurrentModule() && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Module Details</CardTitle>
                          <CardDescription>
                            Edit module information
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <FormLabel>Module Title</FormLabel>
                            <Input
                              value={getCurrentModule()?.title ?? ""}
                              onChange={(e) =>
                                updateModule(
                                  currentModule,
                                  "title",
                                  e.target.value
                                )
                              }
                              placeholder="e.g. Introduction to JavaScript"
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                              A clear title for your module
                            </p>
                          </div>
                          <div>
                            <FormLabel>Module Description</FormLabel>
                            <Textarea
                              value={getCurrentModule()?.description}
                              onChange={(e) =>
                                updateModule(
                                  currentModule,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Describe what students will learn in this module..."
                              className="min-h-[100px]"
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                              Provide an overview of the module content
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {getCurrentLesson() && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Lesson Content</CardTitle>
                          <CardDescription>
                            Create lesson content and materials
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <FormLabel>Lesson Title</FormLabel>
                            <Input
                              value={getCurrentLesson()?.title}
                              onChange={(e) =>
                                updateLesson(
                                  currentModule,
                                  currentLesson,
                                  "title",
                                  e.target.value
                                )
                              }
                              placeholder="e.g. Variables and Data Types"
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                              A clear title for your lesson
                            </p>
                          </div>

                          <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="mt-6"
                          >
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="text">
                                Text Content
                              </TabsTrigger>
                              <TabsTrigger value="video">Video</TabsTrigger>
                              <TabsTrigger value="documents">
                                Documents
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent value="text" className="space-y-4">
                              <div>
                                <FormLabel>Lesson Content</FormLabel>
                                <Textarea
                                  value={getCurrentLesson()?.content}
                                  onChange={(e) =>
                                    updateLesson(
                                      currentModule,
                                      currentLesson,
                                      "content",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter the lesson content here..."
                                  className="min-h-[300px]"
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                  The main text content of your lesson
                                </p>
                              </div>
                            </TabsContent>
                            <TabsContent value="video" className="space-y-4">
                              <div className="space-y-4">
                                {getCurrentLesson()?.videoUrl ? (
                                  <div className="space-y-2">
                                    <div className="aspect-video overflow-hidden rounded-md border bg-muted">
                                      <video
                                        src={getCurrentLesson()?.videoUrl}
                                        controls
                                        className="h-full w-full"
                                      />
                                    </div>
                                    <div className="flex justify-between">
                                      <p className="text-sm text-muted-foreground">
                                        Video uploaded successfully
                                      </p>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                          updateLesson(
                                            currentModule,
                                            currentLesson,
                                            "videoUrl",
                                            ""
                                          )
                                        }
                                      >
                                        Remove Video
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="flex items-center justify-center w-full">
                                      <label
                                        htmlFor="video-upload"
                                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50"
                                      >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                          <FileVideo className="w-10 h-10 mb-3 text-muted-foreground" />
                                          <p className="mb-2 text-sm text-muted-foreground">
                                            <span className="font-semibold">
                                              Click to upload
                                            </span>{" "}
                                            or drag and drop
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            MP4, WebM, OGG (MAX. 100MB)
                                          </p>
                                        </div>
                                        <input
                                          id="video-upload"
                                          type="file"
                                          className="hidden"
                                          accept="video/mp4,video/webm,video/ogg"
                                          onChange={handleVideoUpload}
                                          disabled={isUploading}
                                        />
                                      </label>
                                    </div>
                                    {isUploading && (
                                      <div className="mt-4 space-y-2">
                                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                          <div
                                            className="h-full bg-primary"
                                            style={{
                                              width: `${uploadProgress}%`,
                                            }}
                                          />
                                        </div>
                                        <p className="text-sm text-muted-foreground text-center">
                                          Uploading... {uploadProgress}%
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                            <TabsContent
                              value="documents"
                              className="space-y-4"
                            >
                              <div className="space-y-4">
                                {(() => {
                                  const lesson = getCurrentLesson();
                                  return lesson?.documents &&
                                    lesson.documents.length > 0 ? (
                                    <div className="space-y-2">
                                      <div className="rounded-md border">
                                        <div className="p-4">
                                          <h3 className="text-sm font-medium mb-2">
                                            Attached Documents
                                          </h3>
                                          <div className="space-y-2">
                                            {lesson.documents.map(
                                              (doc: {
                                                id: string;
                                                name: string;
                                                size: number;
                                                url: string;
                                              }) => (
                                                <div
                                                  key={doc.id}
                                                  className="flex items-center justify-between p-2 border rounded-md"
                                                >
                                                  <div className="flex items-center space-x-2">
                                                    <File className="h-5 w-5 text-muted-foreground" />
                                                    <div>
                                                      <p className="text-sm font-medium truncate max-w-[200px]">
                                                        {doc.name}
                                                      </p>
                                                      <p className="text-xs text-muted-foreground">
                                                        {(
                                                          doc.size /
                                                          1024 /
                                                          1024
                                                        ).toFixed(2)}{" "}
                                                        MB
                                                      </p>
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center space-x-2">
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      asChild
                                                    >
                                                      <a
                                                        href={doc.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                      >
                                                        View
                                                      </a>
                                                    </Button>
                                                    <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      onClick={() =>
                                                        removeDocument(doc.id)
                                                      }
                                                    >
                                                      <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center justify-center w-full">
                                        <label
                                          htmlFor="document-upload"
                                          className="flex items-center justify-center w-full h-16 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50"
                                        >
                                          <div className="flex items-center justify-center">
                                            <Upload className="w-5 h-5 mr-2 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">
                                              Upload Additional Documents
                                            </p>
                                          </div>
                                          <input
                                            id="document-upload"
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx"
                                            multiple
                                            onChange={handleDocumentUpload}
                                          />
                                        </label>
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <div className="flex items-center justify-center w-full">
                                        <label
                                          htmlFor="document-upload"
                                          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50"
                                        >
                                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <File className="w-10 h-10 mb-3 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground">
                                              <span className="font-semibold">
                                                Click to upload
                                              </span>{" "}
                                              or drag and drop
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              PDF, DOC, DOCX
                                            </p>
                                          </div>
                                          <input
                                            id="document-upload"
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx"
                                            multiple
                                            onChange={handleDocumentUpload}
                                          />
                                        </label>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const moduleIndex = modules.findIndex(
                                  (m) => m.id === currentModule
                                );
                                const currentModuleData = getCurrentModule();

                                // Check if currentModuleData exists
                                if (currentModuleData) {
                                  const lessonIndex =
                                    currentModuleData.lessons?.findIndex(
                                      (l) => l.id === currentLesson
                                    );

                                  if (
                                    lessonIndex !== undefined &&
                                    lessonIndex > 0
                                  ) {
                                    // Go to previous lesson in the same module
                                    setCurrentLesson(
                                      currentModuleData.lessons[lessonIndex - 1]
                                        .id
                                    );
                                  } else if (moduleIndex > 0) {
                                    // Go to last lesson of previous module
                                    const prevModule = modules[moduleIndex - 1];
                                    setCurrentModule(prevModule.id);
                                    setCurrentLesson(
                                      prevModule.lessons[
                                        prevModule.lessons.length - 1
                                      ].id
                                    );
                                  }
                                }
                              }}
                            >
                              <ArrowLeft className="h-4 w-4 mr-1" />
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const moduleIndex = modules.findIndex(
                                  (m) => m.id === currentModule
                                );
                                const currentModuleData = getCurrentModule();

                                // Check if currentModuleData exists
                                if (currentModuleData) {
                                  const lessonIndex =
                                    currentModuleData.lessons.findIndex(
                                      (l) => l.id === currentLesson
                                    );

                                  if (
                                    lessonIndex <
                                    currentModuleData.lessons.length - 1
                                  ) {
                                    // Go to next lesson in the same module
                                    setCurrentLesson(
                                      currentModuleData.lessons[lessonIndex + 1]
                                        .id
                                    );
                                  } else if (moduleIndex < modules.length - 1) {
                                    // Go to first lesson of next module
                                    const nextModule = modules[moduleIndex + 1];
                                    setCurrentModule(nextModule.id);
                                    setCurrentLesson(nextModule.lessons[0].id);
                                  }
                                }
                              }}
                            >
                              Next
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Saving..." : "Save Course Content"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
