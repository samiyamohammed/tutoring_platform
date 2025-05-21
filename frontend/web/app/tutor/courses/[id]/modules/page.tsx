"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  BookOpen,
  Video,
  FileText,
  Save,
  X,
  ListChecks,
  FileQuestion,
  MoveUp,
  MoveDown,
  CheckCircle,
  Check,
  Circle,
  Type,
  List,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { TutorSidebar } from "@/components/tutor-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type ContentType = "file" | "video" | "text" | "quiz";

interface ContentSection {
  _id?: string;
  title: string;
  description: string;
  type: ContentType;
  content: string;
  file?: File | null;
  quiz?: Quiz | null;
  video?: File | null;
  order: number;
  createdAt?: Date;
}

const DEFAULT_SECTION: ContentSection = {
  title: "",
  description: "",
  type: "text",
  content: "",
  order: 0,
};

type QuestionType = "mcq" | "true_false" | "fill_blank";

interface Quiz {
  _id: string;
  title: string;
  order: number;
  duration: number;
  questions: Question[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Question {
  questionText: string;
  questionType: QuestionType;
  options?: string[];
  correctAnswers: string[]; // Changed to array for multiple answers
  points: number;
  explanation?: string;
}

const DEFAULT_QUIZ: Quiz = {
  _id: "",
  title: "",
  order: 0,
  duration: 30,
  questions: [],
  isPublished: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const DEFAULT_QUESTION: Partial<Question> = {
  questionText: "",
  questionType: "mcq",
  options: ["", "", "", ""],
  correctAnswers: [], // Initialize as empty array
  points: 1,
  explanation: "",
};

export default function CourseContentPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { toast } = useToast();
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [newSection, setNewSection] = useState<ContentSection>({
    ...DEFAULT_SECTION,
  });
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    ...DEFAULT_QUESTION,
  });
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  const isFormValid = () => {
    const baseValid = newSection.title.trim() !== "";

    switch (newSection.type) {
      case "text":
        return baseValid && newSection.content.trim() !== "";
      case "video":
        return baseValid && (newSection.video !== null || newSection.content.trim() !== "");
      case "file":
        return baseValid && (newSection.file !== null);
      case "quiz":
        return (
          baseValid &&
          newSection.quiz != null &&
          newSection.quiz.title.trim() !== "" &&
          newSection.quiz.questions.length > 0
        );
      default:
        return false;
    }
  };

  const handleAddSection = () => {
    if (!isFormValid()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please complete all required fields",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a new section with a temporary ID
      const newSectionWithId = {
        ...newSection,
        _id: `temp-${Date.now()}`,
        createdAt: new Date(),
      };

      setSections([...sections, newSectionWithId]);
      
      // Reset the form for new entry
      setNewSection({
        ...DEFAULT_SECTION,
        order: sections.length + 1,
      });

      toast({
        title: "Success",
        description: "Section added successfully",
        duration: 2000,
      });

      // Scroll to the form for the next entry
      setTimeout(() => {
        document.getElementById("section-form")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add section",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSection = () => {
    if (!isFormValid()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please complete all required fields",
      });
      return;
    }

    try {
      setSections(sections.map(section => 
        section._id === newSection._id ? newSection : section
      ));
      
      setIsAddingSection(false);
      setNewSection({ ...DEFAULT_SECTION });
      
      toast({
        title: "Success",
        description: "Section updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update section",
      });
    }
  };

  const handleQuestionSubmit = () => {
    if (!newQuestion.questionText?.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Question text is required",
      });
      return;
    }

    if (newQuestion.questionType !== "fill_blank" && 
        (!newQuestion.options || newQuestion.options.some(opt => !opt.trim()))) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "All options must be filled",
      });
      return;
    }

    if (newQuestion.correctAnswers?.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "At least one correct answer is required",
      });
      return;
    }

    const questionData: Question = {
      questionText: newQuestion.questionText || "",
      questionType: newQuestion.questionType || "mcq",
      options: newQuestion.questionType === "fill_blank" ? undefined : newQuestion.options,
      correctAnswers: newQuestion.correctAnswers || [],
      points: newQuestion.points || 1,
      explanation: newQuestion.explanation || "",
    };

    if (newSection.quiz) {
      const updatedQuiz = { ...newSection.quiz };

      if (editingQuestionIndex !== null) {
        updatedQuiz.questions[editingQuestionIndex] = questionData;
      } else {
        updatedQuiz.questions.push(questionData);
      }

      setNewSection({
        ...newSection,
        quiz: updatedQuiz,
      });
    }

    setNewQuestion({ ...DEFAULT_QUESTION });
    setEditingQuestionIndex(null);
  };

  const toggleCorrectAnswer = (answer: string) => {
    const currentAnswers = newQuestion.correctAnswers || [];
    const updatedAnswers = currentAnswers.includes(answer)
      ? currentAnswers.filter(a => a !== answer)
      : [...currentAnswers, answer];

    setNewQuestion({
      ...newQuestion,
      correctAnswers: updatedAnswers,
    });
  };

  const renderSectionPreview = (section: ContentSection) => {
    return (
      <div key={section._id} className="rounded-lg border p-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium flex items-center gap-2">
              {section.type === "video" ? (
                <Video className="h-4 w-4" />
              ) : section.type === "file" ? (
                <FileText className="h-4 w-4" />
              ) : section.type === "quiz" ? (
                <FileQuestion className="h-4 w-4" />
              ) : (
                <Type className="h-4 w-4" />
              )}
              {section.title}
            </h3>
            {section.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {section.description}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setNewSection(section);
                setIsAddingSection(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteSection(section._id!)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {section.type === "text" && (
          <div className="mt-3 p-3 bg-muted/50 rounded text-sm">
            {section.content}
          </div>
        )}

        {section.type === "video" && (
          <div className="mt-3">
            {section.video ? (
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                <span>{section.video.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                <span className="truncate max-w-xs">{section.content}</span>
              </div>
            )}
          </div>
        )}

        {section.type === "file" && (
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>{section.file?.name || "Uploaded file"}</span>
            </div>
          </div>
        )}

        {section.type === "quiz" && section.quiz && (
          <div className="mt-3 space-y-4">
            <div className="flex items-center gap-2">
              <FileQuestion className="h-4 w-4" />
              <span className="font-medium">{section.quiz.title}</span>
            </div>
            
            <div className="space-y-3">
              {section.quiz.questions.map((question, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">Q{index + 1}: {question.questionText}</div>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary">
                          {question.points} pt{question.points !== 1 ? "s" : ""}
                        </Badge>
                        <Badge variant="outline">
                          {question.questionType === "mcq"
                            ? "Multiple Choice"
                            : question.questionType === "true_false"
                            ? "True/False"
                            : "Fill in Blank"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setNewQuestion(question);
                          setEditingQuestionIndex(index);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updatedQuiz = { ...section.quiz! };
                          updatedQuiz.questions.splice(index, 1);
                          setNewSection({
                            ...section,
                            quiz: updatedQuiz,
                          });
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {question.questionType !== "fill_blank" && question.options && (
                    <div className="mt-2 space-y-2">
                      <div className="text-sm font-medium">Options:</div>
                      <ul className="space-y-1">
                        {question.options.map((option, optIndex) => (
                          <li 
                            key={optIndex} 
                            className={`flex items-center gap-2 p-1 rounded ${question.correctAnswers.includes(option) ? "bg-green-50" : ""}`}
                          >
                            {question.correctAnswers.includes(option) ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4 text-gray-300" />
                            )}
                            <span>{option}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {question.explanation && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                      <div className="font-medium">Explanation:</div>
                      <div>{question.explanation}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {section.createdAt && (
          <div className="text-xs text-muted-foreground mt-2">
            Added on {new Date(section.createdAt).toLocaleDateString()}
          </div>
        )}
      </div>
    );
  };

  const renderSectionForm = () => {
    return (
      <div className="space-y-4 p-4 border rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">
            {newSection._id ? "Edit Content Section" : "Add New Content Section"}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setNewSection({ ...DEFAULT_SECTION });
              setIsAddingSection(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Section Title*</label>
            <Input
              placeholder="Enter section title"
              value={newSection.title}
              onChange={(e) =>
                setNewSection({ ...newSection, title: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Section description"
              value={newSection.description}
              onChange={(e) =>
                setNewSection({ ...newSection, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Content Type</label>
            <Select
              value={newSection.type}
              onValueChange={(value) => {
                setNewSection({
                  ...newSection,
                  type: value as ContentType,
                  content: "",
                  file: null,
                  quiz: value === "quiz" ? { ...DEFAULT_QUIZ } : null,
                });
                setNewQuestion({ ...DEFAULT_QUESTION });
                setEditingQuestionIndex(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text Content</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="file">File</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {newSection.type === "text" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Content*</label>
              <Textarea
                placeholder="Enter your text content"
                value={newSection.content}
                onChange={(e) =>
                  setNewSection({ ...newSection, content: e.target.value })
                }
                rows={6}
              />
            </div>
          )}

          {newSection.type === "video" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Video Upload*</label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setNewSection({
                        ...newSection,
                        video: e.target.files[0],
                        content: "",
                      });
                    }
                  }}
                />
                {newSection.video && (
                  <span className="text-sm truncate max-w-xs">
                    {newSection.video.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: MP4, WebM, MOV (Max 100MB)
              </p>

              <div className="mt-2">
                <label className="text-sm font-medium">
                  Or enter video URL
                </label>
                <Input
                  placeholder="Enter video URL"
                  value={newSection.content}
                  onChange={(e) =>
                    setNewSection({
                      ...newSection,
                      content: e.target.value,
                      video: null,
                    })
                  }
                />
              </div>
            </div>
          )}

          {newSection.type === "file" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {newSection.file ? "Replace File" : "Upload File"}*
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setNewSection({
                        ...newSection,
                        file: e.target.files[0],
                      });
                    }
                  }}
                />
                {newSection.file && (
                  <span className="text-sm truncate max-w-xs">
                    {newSection.file.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                PDF, Word, PowerPoint, or other course materials (Max 25MB)
              </p>
            </div>
          )}

          {newSection.type === "quiz" && newSection.quiz && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quiz Title*</label>
                <Input
                  placeholder="Enter quiz title"
                  value={newSection.quiz.title}
                  onChange={(e) =>
                    setNewSection({
                      ...newSection,
                      quiz: { ...newSection.quiz!, title: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Quiz Questions</h4>
                {newSection.quiz.questions.length > 0 ? (
                  <div className="space-y-3">
                    {newSection.quiz.questions.map((question, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              Q{index + 1}: {question.questionText.substring(0, 30)}
                              {question.questionText.length > 30 ? "..." : ""}
                            </span>
                            <Badge variant="secondary">
                              {question.points} pt{question.points !== 1 ? "s" : ""}
                            </Badge>
                            <Badge variant="outline">
                              {question.questionType === "mcq"
                                ? "MCQ"
                                : question.questionType === "true_false"
                                ? "True/False"
                                : "Fill Blank"}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setNewQuestion(question);
                                setEditingQuestionIndex(index);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updatedQuiz = { ...newSection.quiz! };
                                updatedQuiz.questions.splice(index, 1);
                                setNewSection({
                                  ...newSection,
                                  quiz: updatedQuiz,
                                });
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No questions added yet
                  </div>
                )}

                <div className="border rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">
                      {editingQuestionIndex !== null
                        ? "Edit Question"
                        : "Add New Question"}
                    </h4>
                    {editingQuestionIndex !== null && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setNewQuestion({ ...DEFAULT_QUESTION });
                          setEditingQuestionIndex(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Question Type
                      </label>
                      <Select
                        value={newQuestion.questionType}
                        onValueChange={(value) =>
                          setNewQuestion({
                            ...newQuestion,
                            questionType: value as QuestionType,
                            options:
                              value === "true_false"
                                ? ["True", "False"]
                                : ["", "", "", ""],
                            correctAnswers: value === "true_false" ? ["True"] : [],
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mcq">Multiple Choice</SelectItem>
                          <SelectItem value="true_false">True/False</SelectItem>
                          <SelectItem value="fill_blank">
                            Fill in the Blank
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Question Text*
                      </label>
                      <Input
                        placeholder="Enter the question"
                        value={newQuestion.questionText}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            questionText: e.target.value,
                          })
                        }
                      />
                    </div>

                    {newQuestion.questionType !== "fill_blank" && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Options*</label>
                        {newQuestion.options?.map((option, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Input
                              placeholder={`Option ${i + 1}`}
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...(newQuestion.options || [])];
                                newOptions[i] = e.target.value;
                                setNewQuestion({
                                  ...newQuestion,
                                  options: newOptions,
                                });
                              }}
                            />
                            <Button
                              variant={
                                newQuestion.correctAnswers?.includes(option)
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => toggleCorrectAnswer(option)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {newQuestion.questionType === "fill_blank" && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Correct Answer(s)*
                        </label>
                        <Textarea
                          placeholder="Enter correct answers (one per line)"
                          value={newQuestion.correctAnswers?.join("\n") || ""}
                          onChange={(e) =>
                            setNewQuestion({
                              ...newQuestion,
                              correctAnswers: e.target.value.split("\n").filter(Boolean),
                            })
                          }
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                          Separate multiple correct answers with new lines
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Points</label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Points for this question"
                        value={newQuestion.points}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            points: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Explanation</label>
                      <Textarea
                        placeholder="Optional explanation for the answer"
                        value={newQuestion.explanation}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            explanation: e.target.value,
                          })
                        }
                        rows={2}
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={handleQuestionSubmit}
                        disabled={
                          !newQuestion.questionText?.trim() ||
                          (newQuestion.questionType !== "fill_blank" &&
                            (!newQuestion.options?.every((o) => o.trim()) ||
                              newQuestion.correctAnswers?.length === 0))
                        }
                      >
                        {editingQuestionIndex !== null
                          ? "Update Question"
                          : "Add Question"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setNewSection({ ...DEFAULT_SECTION });
                setIsAddingSection(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (newSection._id) {
                  handleSaveSection();
                } else {
                  handleAddSection();
                }
              }}
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {newSection._id ? "Save Changes" : "Add Section"}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections(sections.filter((s) => s._id !== sectionId));
    toast({
      title: "Success",
      description: "Section deleted successfully",
    });
  };

  const handleMainAddSectionClick = () => {
    if (isAddingSection) {
      document.getElementById("section-form")?.scrollIntoView({
        behavior: "smooth",
      });
    } else {
      setIsAddingSection(true);
      setNewSection({ ...DEFAULT_SECTION });
    }
  };

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <TutorSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Link
                href="/tutor/courses"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Courses
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Link
                href={`/tutor/courses/${courseId}`}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {courseId}
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Content</span>
            </div>
            <Button onClick={handleMainAddSectionClick}>
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Button>
          </div>

          <div className="flex-1 p-8">
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>
                  Manage all learning content for this course
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* Add Section Form */}
                {isAddingSection && (
                  <div id="section-form">{renderSectionForm()}</div>
                )}

                {/* Sections List */}
                {sections.length > 0 && (
                  <div className="space-y-4">
                    {sections.map((section) => renderSectionPreview(section))}
                  </div>
                )}

                {/* Empty State */}
                {sections.length === 0 && !isAddingSection && (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">
                      No content sections yet
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add your first content section to get started
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => setIsAddingSection(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Content Section
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}