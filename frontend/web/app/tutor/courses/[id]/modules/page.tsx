"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  FileQuestion,
  Loader2,
  CheckCircle,
  Check,
  Circle,
  Type,
  ChevronDown,
  ChevronUp,
  List,
  Grid,
  Search,
  Download,
  AlertCircle,
  ZoomIn,
  Fullscreen,
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
import { toast } from "sonner";
import { TutorSidebar } from "@/components/tutor-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

type ContentType = "text" | "video" | "pdf" | "quiz";

interface ContentSection {
  _id?: string;
  title: string;
  description: string;
  type: ContentType;
  content: string;
  file?: File | null;
  quiz?: Quiz | null;
  video?: File | null;
  videoUrl?: string;
  pdfUrl?: string;
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

interface Course {
  _id: string;
  title: string;
}

interface Question {
  questionText: string;
  questionType: QuestionType;
  options?: string[];
  correctAnswer: string;
  correctAnswers: string[];
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
  correctAnswer: "",
  correctAnswers: [],
  points: 1,
  explanation: "",
};

interface Module {
  _id: string;
  title: string;
  content: string;
  order: number;
  isPublished: boolean;
  sections: ContentSection[];
  createdAt: Date;
  updatedAt: Date;
}

interface FinalExam {
  _id?: string;
  title: string;
  description?: string;
  passingScore: number;
  totalQuestions: number;
  duration: number;
  questions: FinalExamQuestion[];
  isPublished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FinalExamQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
  points: number;
  explanation?: string;
}

interface AssessmentQuestion {
  _id?: string;
  questionText: string;
  type: "mcq" | "shortAnswer";
  options?: string[];
  correctAnswer?: string;
  points?: number;
  explanation?: string;
}

interface Assessment {
  _id?: string;
  preAssessment: AssessmentQuestion[];
  postAssessment: AssessmentQuestion[];
}
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function CourseContentPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  // State for modules list
  const [course, setCourse] = useState<Course>();
  const [modules, setModules] = useState<Module[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModuleForm, setShowModuleForm] = useState(false);

  // State for new module creation
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [newSection, setNewSection] = useState<ContentSection>({
    ...DEFAULT_SECTION,
  });
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    ...DEFAULT_QUESTION,
  });
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleContent, setModuleContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);

  // State for final exam
  const [finalExam, setFinalExam] = useState<FinalExam>({
    title: "Final Exam",
    description: "",
    passingScore: 70,
    totalQuestions: 0,
    duration: 60,
    questions: [],
    isPublished: false,
  });
  const [isEditingFinalExam, setIsEditingFinalExam] = useState(false);
  const [newFinalExamQuestion, setNewFinalExamQuestion] =
    useState<FinalExamQuestion>({
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 1,
      explanation: "",
    });

  const [assessment, setAssessment] = useState<Assessment>({
    preAssessment: [],
    postAssessment: [],
  });
  const [isEditingAssessment, setIsEditingAssessment] = useState(false);
  const [newAssessmentQuestion, setNewAssessmentQuestion] =
    useState<AssessmentQuestion>({
      questionText: "",
      type: "mcq",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 1,
    });
  const [editingAssessmentQuestionIndex, setEditingAssessmentQuestionIndex] =
    useState<{ type: "pre" | "post"; index: number } | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const [courseResponse, finalExamResponse, assesmentResponse] =
          await Promise.all([
            fetch(`${baseUrl}/api/course/${courseId}`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch(`${baseUrl}/api/course/${courseId}/final-exam`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch(`${baseUrl}/api/course/${courseId}/assessment`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        if (!courseResponse.ok) {
          throw new Error("Failed to fetch course data");
        }

        const courseData = await courseResponse.json();
        setModules(courseData.modules);
        setCourse(courseData);

        // Handle final exam response more gracefully
        if (finalExamResponse.ok) {
          try {
            const finalExamData = await finalExamResponse.json();
            setFinalExam({
              ...finalExamData,
              questions: finalExamData.questions || [],
            });
          } catch (error) {
            console.log("No final exam data found, using default");
            // Keep the default final exam state
          }
        }
        if (assesmentResponse.ok) {
          try {
            const assessmentData = await assesmentResponse.json();
            setAssessment(assessmentData);
          } catch (error) {
            console.log("No assessment data found");
          }
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to fetch course data"
        );
      } finally {
        setLoadingModules(false);
      }
    };

    fetchCourseData();
  }, [courseId, toast]);

  const extractIdFromUrl = (url: string): string | null => {
    const parts = url.split("/");
    return parts.length > 0 ? parts[parts.length - 1] : null;
  };

  const getMediaUrl = (url: string): string => {
    const id = extractIdFromUrl(url);
    if (!id) return "";

    if (url.includes("/api/files/")) {
      return `${baseUrl}/api/files/${id}`;
    }
    if (url.includes("/api/videos/")) {
      return `${baseUrl}/api/videos/stream/${id}`;
    }
    return id;
  };

  const filteredModules =
    modules?.filter(
      (module) =>
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.content.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleViewModule = (module: Module) => {
    setSelectedModule(module);
    setShowModuleForm(false);
  };

  const handleEditModule = (module: Module) => {
    setSelectedModule(null);
    setEditingModuleId(module._id);
    setModuleTitle(module.title);
    setModuleContent(module.content);
    setIsPublished(module.isPublished);
    setSections(module.sections);
    setShowModuleForm(true);
  };

  const handleCreateNewModule = () => {
    setSelectedModule(null);
    setEditingModuleId(null);
    setModuleTitle("");
    setModuleContent("");
    setIsPublished(true);
    setSections([]);
    setShowModuleForm(true);
  };

  const handleBackToModules = () => {
    setSelectedModule(null);
    setShowModuleForm(false);
  };

  const isFormValid = () => {
    const baseValid = newSection.title.trim() !== "";

    switch (newSection.type) {
      case "text":
        return baseValid && newSection.content.trim() !== "";
      case "video":
      case "pdf":
        return (
          baseValid &&
          (newSection.file !== null ||
            newSection.video !== null ||
            newSection.content.trim() !== "")
        );
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

  const preparePayload = () => {
    const formData = new FormData();

    formData.append("title", moduleTitle);
    formData.append("content", moduleContent);
    formData.append("order", (modules.length + 1).toString());
    formData.append("isPublished", isPublished.toString());

    const processedSections = sections.map((section, index) => {
      const payloadSection: any = {
        title: section.title,
        order: index + 1,
        type: section.type,
      };

      switch (section.type) {
        case "text":
          payloadSection.content = section.content;
          break;
        case "video":
          if (section.video) {
            formData.append("files", section.video);
          } else if (section.content) {
            payloadSection.content = section.content;
          }
          break;
        case "pdf":
          if (section.file) {
            formData.append("files", section.file);
          }
          break;
        case "quiz":
          if (section.quiz) {
            payloadSection.quiz = {
              title: section.quiz.title,
              order: index + 1,
              duration: section.quiz.duration || 30,
              isPublished: section.quiz.isPublished || false,
              questions: section.quiz.questions.map((q) => ({
                questionText: q.questionText,
                questionType: q.questionType,
                options:
                  q.questionType === "fill_blank" ? undefined : q.options,
                correctAnswers: q.correctAnswers,
                points: q.points || 1,
                explanation: q.explanation || "",
              })),
            };
          }
          break;
      }

      return payloadSection;
    });

    formData.append("sections", JSON.stringify(processedSections));
    return formData;
  };

  const handleSubmitModule = async () => {
    if (!moduleTitle.trim() || !moduleContent.trim()) {
      toast.error("Module title and description are required");
    }

    if (sections.length === 0) {
      toast.error("Please add at least one section to the module");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = preparePayload();
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const url = editingModuleId
        ? `${baseUrl}/api/course/${courseId}/modules/${editingModuleId}`
        : `${baseUrl}/api/course/${courseId}/modules`;

      const method = editingModuleId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save module");
      }

      const result = await response.json();

      toast.success(
        editingModuleId
          ? "Module updated successfully"
          : "Module created successfully"
      );

      // Refresh modules list
      const modulesResponse = await fetch(
        `${baseUrl}/api/course/${courseId}/modules`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (modulesResponse.ok) {
        const data = await modulesResponse.json();
        setModules(data.modules);
      }

      setShowModuleForm(false);
      setEditingModuleId(null);
    } catch (error) {
      console.error("Error submitting module:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save module"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAssessment = async () => {
    const method = isEditingAssessment ? "PUT" : "POST";
    const url = `${baseUrl}/api/course/${courseId}/assessment`;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preAssessment: [newAssessmentQuestion] }), // Adjust as needed
      });

      if (!response.ok) {
        throw new Error("Failed to save assessment");
      }

      const result = await response.json();
      setAssessment(result);
      toast.success("Assessment saved successfully");
      setIsEditingAssessment(false);
    } catch (error) {
      toast.error("Error saving assessment");
    }
  };

  const fetchAssessment = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `${baseUrl}/api/course/${courseId}/assessment`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAssessment(data);
      } else if (response.status !== 404) {
        throw new Error("Failed to fetch assessment");
      }
    } catch (error) {
      console.error("Error fetching assessment:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load assessment"
      );
    }
  };

  const handleSaveAssessment = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const method = assessment._id ? "PUT" : "POST";
      const response = await fetch(
        `${baseUrl}/api/course/${courseId}/assessment`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(assessment),
        }
      );

      if (!response.ok) throw new Error("Failed to save assessment");

      const data = await response.json();
      setAssessment(data);
      setIsEditingAssessment(false);
      toast.success("Assessment saved successfully");
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save assessment"
      );
    }
  };

  const handleDeleteAssessment = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `${baseUrl}/api/course/${courseId}/assessment`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete assessment");

      setAssessment({
        preAssessment: [],
        postAssessment: [],
      });
      toast.success("Assessment deleted successfully");
    } catch (error) {
      console.error("Error deleting assessment:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete assessment"
      );
    }
  };

  const handleAddAssessmentQuestion = (type: "pre" | "post") => {
    if (!newAssessmentQuestion.questionText.trim()) {
      toast.error("Question text is required");
      return;
    }

    if (
      newAssessmentQuestion.type === "mcq" &&
      (!newAssessmentQuestion.options ||
        newAssessmentQuestion.options.some((o) => !o.trim()))
    ) {
      toast.error("All MCQ options must be filled");
      return;
    }

    const updatedAssessment = { ...assessment };
    const question = { ...newAssessmentQuestion };

    if (
      editingAssessmentQuestionIndex &&
      editingAssessmentQuestionIndex.type === type
    ) {
      updatedAssessment[`${type}Assessment`][
        editingAssessmentQuestionIndex.index
      ] = question;
    } else {
      updatedAssessment[`${type}Assessment`].push(question);
    }

    setAssessment(updatedAssessment);
    setNewAssessmentQuestion({
      questionText: "",
      type: "mcq",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 1,
    });
    setEditingQuestionIndex(null);
  };

  const handleDeleteModule = async (moduleId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${baseUrl}/api/course/${courseId}/modules/${moduleId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete module");
      }

      toast.success("Module deleted successfully");

      // Refresh modules list
      const modulesResponse = await fetch(
        `${baseUrl}/api/course/${courseId}/modules`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (modulesResponse.ok) {
        const data = await modulesResponse.json();
        setModules(data.modules);
      }
    } catch (error) {
      console.error("Error deleting module:", error);
      toast.error("Failed to delete module"
      );
    }
  };

  const handleAddSection = () => {
    if (!isFormValid()) {
      toast.error("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const newSectionWithId = {
        ...newSection,
        _id: `temp-${Date.now()}`,
        createdAt: new Date(),
        order: sections.length + 1,
      };

      setSections([...sections, newSectionWithId]);
      setNewSection({
        ...DEFAULT_SECTION,
        order: sections.length + 2,
      });

      toast.success("Section added successfully");

      setTimeout(() => {
        document.getElementById("section-form")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    } catch (error) {
      toast.error("Failed to add section");
    } finally {
      setIsSubmitting(false);
    }
  };

  // In your frontend code
  const handleSaveSection = async () => {
    if (!isFormValid()) {
      toast.error("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare form data for file uploads
      const formData = new FormData();
      let hasFiles = false;

      if (newSection.type === "video" && newSection.video) {
        formData.append("files", newSection.video);
        hasFiles = true;
      } else if (newSection.type === "pdf" && newSection.file) {
        formData.append("files", newSection.file);
        hasFiles = true;
      }

      // Add other section data
      const sectionData = {
        ...newSection,
        // Don't send file objects in JSON
        file: undefined,
        video: undefined,
      };
      formData.append("section", JSON.stringify(sectionData));

      const token = localStorage.getItem("token");
      const url = editingModuleId
        ? `${baseUrl}/api/course/${courseId}/modules/${editingModuleId}/sections/${newSection._id}`
        : selectedModule && selectedModule._id
        ? `${baseUrl}/api/course/${courseId}/modules/${selectedModule._id}/sections`
        : "";

      const method = newSection._id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: hasFiles ? formData : JSON.stringify(sectionData),
      });

      if (!response.ok) {
        throw new Error("Failed to save section");
      }

      const result = await response.json();

      // Update local state
      if (newSection._id) {
        setSections(
          sections.map((s) => (s._id === newSection._id ? result : s))
        );
      } else {
        setSections([...sections, result]);
      }

      toast.success("Section saved successfully");
      setIsAddingSection(false);
      setNewSection({ ...DEFAULT_SECTION });
    } catch (error) {
      console.error("Error saving section:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save section"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSection = (section: ContentSection) => {
    setNewSection(section);
    setIsAddingSection(true);
  };

  const handleDeleteSection = (sectionId: string) => {
    setSections(sections.filter((s) => s._id !== sectionId));
    toast("Section deleted successfully");
  };

  const handleQuestionSubmit = () => {
    if (!newQuestion.questionText?.trim()) {
      toast.error("Question text is required");
      return;
    }

    if (
      newQuestion.questionType !== "fill_blank" &&
      (!newQuestion.options || newQuestion.options.some((opt) => !opt.trim()))
    ) {
      toast.error("All options must be filled");
      return;
    }

    if (
      !newQuestion.correctAnswer?.trim() &&
      newQuestion.correctAnswers?.length === 0
    ) {
      toast.error("At least one correct answer is required");
      return;
    }

    const questionData: Question = {
      questionText: newQuestion.questionText || "",
      questionType: newQuestion.questionType || "mcq",
      options:
        newQuestion.questionType === "fill_blank"
          ? undefined
          : newQuestion.options,
      correctAnswer:
        newQuestion.correctAnswer || newQuestion.correctAnswers?.[0] || "",
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
      ? currentAnswers.filter((a) => a !== answer)
      : [...currentAnswers, answer];

    setNewQuestion({
      ...newQuestion,
      correctAnswer: updatedAnswers[0] || "",
      correctAnswers: updatedAnswers,
    });
  };

  const handleMainAddSectionClick = () => {
    if (isAddingSection) {
      document.getElementById("section-form")?.scrollIntoView({
        behavior: "smooth",
      });
    } else {
      setIsAddingSection(true);
      setNewSection({ ...DEFAULT_SECTION, order: sections.length + 1 });
    }
  };

  const handleAddFinalExamQuestion = () => {
    if (
      !newFinalExamQuestion.questionText?.trim() ||
      !newFinalExamQuestion.correctAnswer?.trim() ||
      newFinalExamQuestion.options?.some((opt) => !opt.trim())
    ) {
      toast.error("Question text, options, and correct answer are required");
      return;
    }

    setFinalExam((prev) => {
      const currentQuestions = prev.questions || [];
      const isEditing = editingQuestionIndex !== null;

      return {
        ...prev,
        questions: isEditing
          ? currentQuestions.map((q, index) =>
              index === editingQuestionIndex ? newFinalExamQuestion : q
            )
          : [...currentQuestions, newFinalExamQuestion],
        totalQuestions: isEditing
          ? currentQuestions.length
          : currentQuestions.length + 1,
      };
    });

    setNewFinalExamQuestion({
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 1,
      explanation: "",
    });
    setEditingQuestionIndex(null);
  };

  const handleEditFinalExamQuestion = (
    question: FinalExamQuestion,
    index: number
  ) => {
    setNewFinalExamQuestion(question);
    setEditingQuestionIndex(index);
  };

  const handleDeleteFinalExamQuestion = (index: number) => {
    setFinalExam((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
      totalQuestions: prev.questions.length - 1,
    }));
    toast("Question deleted successfully");
  };

  const renderAssessmentQuestionForm = (type: "pre" | "post") => (
    <>
      <div className="space-y-2">
        <Label>Question Type</Label>
        <Select
          value={newAssessmentQuestion.type}
          onValueChange={(value: "mcq" | "shortAnswer") => {
            setNewAssessmentQuestion({
              ...newAssessmentQuestion,
              type: value,
              options: value === "mcq" ? ["", "", "", ""] : undefined,
              correctAnswer: value === "mcq" ? "" : undefined,
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mcq">Multiple Choice</SelectItem>
            <SelectItem value="shortAnswer">Short Answer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Question Text*</Label>
        <Textarea
          placeholder="Enter the question"
          value={newAssessmentQuestion.questionText}
          onChange={(e) =>
            setNewAssessmentQuestion({
              ...newAssessmentQuestion,
              questionText: e.target.value,
            })
          }
          rows={2}
        />
      </div>

      {newAssessmentQuestion.type === "mcq" && (
        <div className="space-y-2">
          <Label>Options*</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {newAssessmentQuestion.options?.map((option, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder={`Option ${i + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [
                      ...(newAssessmentQuestion.options || []),
                    ];
                    newOptions[i] = e.target.value;
                    setNewAssessmentQuestion({
                      ...newAssessmentQuestion,
                      options: newOptions,
                    });
                  }}
                />
                <Button
                  variant={
                    option === newAssessmentQuestion.correctAnswer
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className="h-10 w-10 p-0"
                  onClick={() =>
                    setNewAssessmentQuestion({
                      ...newAssessmentQuestion,
                      correctAnswer: option,
                    })
                  }
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Points</Label>
          <Input
            type="number"
            min="1"
            value={newAssessmentQuestion.points || 1}
            onChange={(e) =>
              setNewAssessmentQuestion({
                ...newAssessmentQuestion,
                points: parseInt(e.target.value) || 1,
              })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Explanation (Optional)</Label>
        <Input
          placeholder="Add explanation for the answer"
          value={newAssessmentQuestion.explanation || ""}
          onChange={(e) =>
            setNewAssessmentQuestion({
              ...newAssessmentQuestion,
              explanation: e.target.value,
            })
          }
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {editingAssessmentQuestionIndex &&
          editingAssessmentQuestionIndex.type === type && (
            <Button
              variant="outline"
              onClick={() => {
                setNewAssessmentQuestion({
                  questionText: "",
                  type: "mcq",
                  options: ["", "", "", ""],
                  correctAnswer: "",
                  points: 1,
                });
                setEditingQuestionIndex(null);
              }}
            >
              Cancel
            </Button>
          )}
        <Button
          onClick={() => handleAddAssessmentQuestion(type)}
          disabled={
            !newAssessmentQuestion.questionText ||
            (newAssessmentQuestion.type === "mcq" &&
              (!newAssessmentQuestion.options ||
                newAssessmentQuestion.options.some((o) => !o.trim()) ||
                !newAssessmentQuestion.correctAnswer))
          }
        >
          {editingAssessmentQuestionIndex?.type === type
            ? "Update Question"
            : "Add Question"}
        </Button>
      </div>
    </>
  );

  const renderAssessmentTab = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Course Assessments</h1>
          <p className="text-muted-foreground mt-1">
            Pre-course and post-course assessments
          </p>
        </div>
        {assessment._id && !isEditingAssessment && (
          <Button onClick={() => setIsEditingAssessment(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Assessments
          </Button>
        )}
      </div>

      {isEditingAssessment ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Assessments</CardTitle>
            <CardDescription>
              Configure pre-course and post-course assessments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Pre-Assessment Section */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Pre-Assessment</h3>
              {assessment.preAssessment.length > 0 ? (
                <div className="space-y-4">
                  {assessment.preAssessment.map((question, index) => (
                    <Card key={`pre-${index}`}>
                      <CardHeader className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-base">
                              Q{index + 1}: {question.questionText}
                            </CardTitle>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="secondary">
                                {question.points || 1} point
                                {question.points !== 1 ? "s" : ""}
                              </Badge>
                              <Badge variant="outline">
                                {question.type === "mcq"
                                  ? "Multiple Choice"
                                  : "Short Answer"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setNewAssessmentQuestion(question);
                                setEditingAssessmentQuestionIndex({
                                  type: "pre",
                                  index,
                                });
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = { ...assessment };
                                updated.preAssessment.splice(index, 1);
                                setAssessment(updated);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {question.type === "mcq" && question.options && (
                        <CardContent className="p-4 pt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`flex items-start gap-3 p-2 rounded ${
                                  question.correctAnswer === option
                                    ? "bg-green-50 border-green-200"
                                    : "bg-muted/50"
                                }`}
                              >
                                <div className="flex items-center h-5 mt-0.5">
                                  {question.correctAnswer === option ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="text-sm">{option}</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-lg bg-muted/30">
                  <FileQuestion className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No pre-assessment questions added yet
                  </p>
                </div>
              )}

              {/* Pre-Assessment Question Form */}
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {editingAssessmentQuestionIndex?.type === "pre"
                      ? "Edit Question"
                      : "Add Pre-Assessment Question"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderAssessmentQuestionForm("pre")}
                </CardContent>
              </Card>
            </div>

            {/* Post-Assessment Section */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Post-Assessment</h3>
              {assessment.postAssessment.length > 0 ? (
                <div className="space-y-4">
                  {assessment.postAssessment.map((question, index) => (
                    <Card key={`post-${index}`}>
                      <CardHeader className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-base">
                              Q{index + 1}: {question.questionText}
                            </CardTitle>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="secondary">
                                {question.points || 1} point
                                {question.points !== 1 ? "s" : ""}
                              </Badge>
                              <Badge variant="outline">
                                {question.type === "mcq"
                                  ? "Multiple Choice"
                                  : "Short Answer"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setNewAssessmentQuestion(question);
                                setEditingAssessmentQuestionIndex({
                                  type: "post",
                                  index,
                                });
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updated = { ...assessment };
                                updated.postAssessment.splice(index, 1);
                                setAssessment(updated);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {question.type === "mcq" && question.options && (
                        <CardContent className="p-4 pt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`flex items-start gap-3 p-2 rounded ${
                                  question.correctAnswer === option
                                    ? "bg-green-50 border-green-200"
                                    : "bg-muted/50"
                                }`}
                              >
                                <div className="flex items-center h-5 mt-0.5">
                                  {question.correctAnswer === option ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="text-sm">{option}</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-lg bg-muted/30">
                  <FileQuestion className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No post-assessment questions added yet
                  </p>
                </div>
              )}

              {/* Post-Assessment Question Form */}
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {editingAssessmentQuestionIndex?.type === "post"
                      ? "Edit Question"
                      : "Add Post-Assessment Question"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderAssessmentQuestionForm("post")}
                </CardContent>
              </Card>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between">
              <div>
                {assessment._id && (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAssessment}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Assessments
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditingAssessment(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveAssessment}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Assessments
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Course Assessments</CardTitle>
                <CardDescription className="mt-1">
                  Pre and post course evaluations
                </CardDescription>
              </div>
              {assessment._id && (
                <Badge variant="default">
                  {assessment.preAssessment.length +
                    assessment.postAssessment.length}{" "}
                  Questions
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pre-Assessment Summary */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Pre-Assessment</h3>
                  <Badge variant="secondary">
                    {assessment.preAssessment.length} Questions
                  </Badge>
                </div>
                {assessment.preAssessment.length > 0 ? (
                  <div className="space-y-3">
                    {assessment.preAssessment
                      .slice(0, 2)
                      .map((question, index) => (
                        <div
                          key={`pre-summary-${index}`}
                          className="border rounded p-3"
                        >
                          <div className="font-medium">
                            Q{index + 1}:{" "}
                            {question.questionText.substring(0, 50)}
                            {question.questionText.length > 50 ? "..." : ""}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">
                              {question.type === "mcq" ? "MCQ" : "Short Answer"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    {assessment.preAssessment.length > 2 && (
                      <div className="text-center text-sm text-muted-foreground">
                        + {assessment.preAssessment.length - 2} more questions
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No pre-assessment questions
                  </div>
                )}
              </div>

              {/* Post-Assessment Summary */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Post-Assessment</h3>
                  <Badge variant="secondary">
                    {assessment.postAssessment.length} Questions
                  </Badge>
                </div>
                {assessment.postAssessment.length > 0 ? (
                  <div className="space-y-3">
                    {assessment.postAssessment
                      .slice(0, 2)
                      .map((question, index) => (
                        <div
                          key={`post-summary-${index}`}
                          className="border rounded p-3"
                        >
                          <div className="font-medium">
                            Q{index + 1}:{" "}
                            {question.questionText.substring(0, 50)}
                            {question.questionText.length > 50 ? "..." : ""}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">
                              {question.type === "mcq" ? "MCQ" : "Short Answer"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    {assessment.postAssessment.length > 2 && (
                      <div className="text-center text-sm text-muted-foreground">
                        + {assessment.postAssessment.length - 2} more questions
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No post-assessment questions
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button onClick={() => setIsEditingAssessment(true)}>
                {assessment._id ? "Edit Assessments" : "Create Assessments"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const handleSaveFinalExam = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      if (!finalExam.title || finalExam.questions.length === 0) {
        throw new Error("Please fill all required fields");
      }

      const method = finalExam._id ? "PUT" : "POST";
      const url = `${baseUrl}/api/course/${courseId}/final-exam`;

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...finalExam,
          totalQuestions: finalExam.questions.length,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to save final exam");
      }

      // Handle empty response case
      let result;
      try {
        result = await response.json();
      } catch {
        // If response is empty but successful, just use the current state
        result = finalExam;
      }

      setFinalExam(result);
      toast.success("Final exam saved successfully");
      setIsEditingFinalExam(false);
    } catch (error) {
      toast.error("Failed to save final exam"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFinalExam = async () => {
    if (!finalExam._id) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${baseUrl}/api/course/${courseId}/final-exam`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete final exam");
      }

      toast.success("Final exam deleted successfully");

      setFinalExam({
        title: "Final Exam",
        description: "",
        passingScore: 70,
        totalQuestions: 0,
        duration: 60,
        questions: [],
        isPublished: false,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete final exam"
      );
    }
  };

  const renderSectionPreview = (section: ContentSection) => {
    return (
      <div
        key={section._id}
        className="rounded-lg border p-4 mb-4 bg-white shadow-sm"
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">
                {section.type === "video" ? (
                  <Video className="h-4 w-4 text-blue-500" />
                ) : section.type === "pdf" ? (
                  <FileText className="h-4 w-4 text-red-500" />
                ) : section.type === "quiz" ? (
                  <FileQuestion className="h-4 w-4 text-purple-500" />
                ) : (
                  <Type className="h-4 w-4 text-gray-500" />
                )}
                {section.title}
              </h3>
              <Badge variant="outline">Section {section.order}</Badge>
            </div>
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
              onClick={() => handleEditSection(section)}
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
          <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
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

        {section.type === "pdf" && (
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
                      <div className="font-medium">
                        Q{index + 1}: {question.questionText}
                      </div>
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

                  {question.questionType !== "fill_blank" &&
                    question.options && (
                      <div className="mt-2 space-y-2">
                        <div className="text-sm font-medium">Options:</div>
                        <ul className="space-y-1">
                          {question.options.map((option, optIndex) => (
                            <li
                              key={optIndex}
                              className={`flex items-center gap-2 p-1 rounded ${
                                question.correctAnswers.includes(option)
                                  ? "bg-green-50"
                                  : ""
                              }`}
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
      <div className="space-y-4 p-4 border rounded-lg mb-6 bg-white shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-lg">
            {newSection._id
              ? "Edit Content Section"
              : "Add New Content Section"}
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
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Content Type</label>
            <Select
              value={newSection.type}
              onValueChange={(value: ContentType) => {
                setNewSection({
                  ...newSection,
                  type: value as ContentType,
                  content: "",
                  file: null,
                  video: null,
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
                <SelectItem value="pdf">PDF</SelectItem>
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
                className="min-h-[150px]"
              />
            </div>
          )}

          {newSection.type === "video" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Video Content</label>
                <div className="flex flex-col space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Upload Video File
                    </label>
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
                  </div>

                  <div className="relative flex items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink mx-4 text-sm text-muted-foreground">
                      OR
                    </span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Enter Video URL
                    </label>
                    <Input
                      placeholder="https://example.com/video.mp4"
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
              </div>
            </div>
          )}

          {newSection.type === "pdf" && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                PDF File*
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="application/pdf"
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
                PDF files only (Max 25MB)
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Duration (minutes)*
                  </label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Quiz duration"
                    value={newSection.quiz.duration}
                    onChange={(e) =>
                      setNewSection({
                        ...newSection,
                        quiz: {
                          ...newSection.quiz!,
                          duration: Number(e.target.value) || 30,
                        },
                      })
                    }
                  />
                </div>
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
                              Q{index + 1}:{" "}
                              {question.questionText.substring(0, 30)}
                              {question.questionText.length > 30 ? "..." : ""}
                            </span>
                            <Badge variant="secondary">
                              {question.points} pt
                              {question.points !== 1 ? "s" : ""}
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
                        onValueChange={(value: QuestionType) =>
                          setNewQuestion({
                            ...newQuestion,
                            questionType: value as QuestionType,
                            options:
                              value === "true_false"
                                ? ["True", "False"]
                                : ["", "", "", ""],
                            correctAnswers:
                              value === "true_false" ? ["True"] : [],
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
                                const newOptions = [
                                  ...(newQuestion.options || []),
                                ];
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
                              correctAnswers: e.target.value
                                .split("\n")
                                .filter(Boolean),
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

  const renderModuleCard = (module: Module) => (
    <Card key={module._id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {module.title}
              {module.isPublished ? (
                <Badge variant="default">Published</Badge>
              ) : (
                <Badge variant="secondary">Draft</Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              {module.content.substring(0, 100)}
              {module.content.length > 100 ? "..." : ""}
            </CardDescription>
          </div>
          <Badge variant="outline" className="ml-2">
            Module {module.order}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {module.sections.length} sections
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewModule(module)}
            >
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditModule(module)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteModule(module._id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderModuleDetails = (module: Module) => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{module.title}</h2>
          <div className="flex items-center gap-2 mt-1">
            {module.isPublished ? (
              <Badge variant="default">Published</Badge>
            ) : (
              <Badge variant="secondary">Draft</Badge>
            )}
            <Badge variant="outline">Module {module.order}</Badge>
            <span className="text-sm text-muted-foreground">
              Created: {new Date(module.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBackToModules}>
            Back to Modules
          </Button>
          <Button variant="outline" onClick={() => handleEditModule(module)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Module
          </Button>
        </div>
      </div>

      <div className="prose max-w-none">
        <h3 className="text-lg font-medium mb-2">Description</h3>
        <p>{module.content}</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Content Sections</h3>
        {module.sections.length > 0 ? (
          <div className="space-y-4">
            {module.sections.map((section) => (
              <Collapsible key={section._id}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      {section.type === "video" ? (
                        <Video className="h-5 w-5 text-blue-500" />
                      ) : section.type === "pdf" ? (
                        <FileText className="h-5 w-5 text-red-500" />
                      ) : section.type === "quiz" ? (
                        <FileQuestion className="h-5 w-5 text-purple-500" />
                      ) : (
                        <Type className="h-5 w-5 text-gray-500" />
                      )}
                      <span className="font-medium">{section.title}</span>
                      <Badge variant="outline">Section {section.order}</Badge>
                    </div>
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 border rounded-b-lg bg-white">
                  {section.type === "text" && (
                    <div className="prose max-w-none">
                      <h4 className="text-sm font-medium mb-2">Content</h4>
                      <p>{section.content}</p>
                    </div>
                  )}

                  {section.type === "video" && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">Video Content</h4>
                        {section.videoUrl && (
                          <a
                            href={getMediaUrl(section.videoUrl)}
                            download
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </a>
                        )}
                      </div>

                      {section.videoUrl ? (
                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-md">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <video
                              controls
                              className="w-full h-full object-contain"
                              poster="/video-thumbnail-placeholder.png"
                              onError={(e) => {
                                const video = e.target as HTMLVideoElement;
                                video.parentElement!.parentElement!.innerHTML = `
                                  <div class="w-full h-full flex items-center justify-center p-6 bg-red-50 text-red-600 rounded-lg">
                                    <div class="text-center">
                                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                                      <p>Failed to load video.</p>
                                      <p class="text-sm">Please check the URL or try again later.</p>
                                    </div>
                                  </div>
                                `;
                              }}
                            >
                              <source
                                src={getMediaUrl(section.videoUrl)}
                                type="video/mp4"
                              />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </div>
                      ) : section.content ? (
                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-md">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <video
                              controls
                              className="w-full h-full object-contain"
                              poster="/video-thumbnail-placeholder.png"
                            >
                              <source src={section.content} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed">
                          <Video className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-gray-500 text-center">
                            Video file uploaded:{" "}
                            {section.video?.name || "No video available"}
                          </p>
                        </div>
                      )}

                      {section.description && (
                        <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                          {section.description}
                        </div>
                      )}
                    </div>
                  )}

                  {section.type === "pdf" && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">PDF Document</h4>
                        {section.pdfUrl && (
                          <a
                            href={getMediaUrl(section.pdfUrl)}
                            download
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </a>
                        )}
                      </div>

                      {section.pdfUrl ? (
                        <div className="border rounded-lg overflow-hidden shadow-sm">
                          <div className="h-[500px] w-full relative">
                            <iframe
                              src={`${getMediaUrl(section.pdfUrl)}#view=fitH`}
                              className="w-full h-full"
                              title={section.title}
                              onError={(e) => {
                                const iframe = e.target as HTMLIFrameElement;
                                iframe.parentElement!.innerHTML = `
                                  <div class="w-full h-full flex items-center justify-center p-6 bg-red-50 text-red-600 rounded-lg">
                                    <div class="text-center">
                                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                                      <p>Failed to load PDF.</p>
                                      <p class="text-sm">Please check the file or try again later.</p>
                                    </div>
                                  </div>
                                `;
                              }}
                            />
                            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                          </div>
                          <div className="bg-gray-50 px-4 py-2 border-t flex justify-between items-center">
                            <span className="text-sm text-gray-600 truncate">
                              {section.title}.pdf
                            </span>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600"
                              >
                                <ZoomIn className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600"
                              >
                                <Fullscreen className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed">
                          <FileText className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-gray-500 text-center">
                            PDF file: {section.file?.name || "No PDF available"}
                          </p>
                        </div>
                      )}

                      {section.description && (
                        <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                          {section.description}
                        </div>
                      )}
                    </div>
                  )}

                  {section.type === "quiz" && section.quiz && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">
                          {section.quiz.title}
                        </h4>
                        <div className="flex gap-2">
                          <Badge variant="secondary">
                            {section.quiz.questions.length} Questions
                          </Badge>
                          <Badge variant="outline">
                            Duration: {section.quiz.duration} mins
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {section.quiz.questions.map((question, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-medium">
                                  Q{index + 1}: {question.questionText}
                                </div>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="secondary">
                                    {question.points} pt
                                    {question.points !== 1 ? "s" : ""}
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
                            </div>

                            {question.questionType !== "fill_blank" &&
                              question.options && (
                                <div className="mt-3 space-y-2">
                                  <div className="text-sm font-medium">
                                    Options:
                                  </div>
                                  <ul className="space-y-1">
                                    {question.options.map(
                                      (option, optIndex) => (
                                        <li
                                          key={optIndex}
                                          className={`flex items-center gap-2 p-2 rounded ${
                                            question.correctAnswers.includes(
                                              option
                                            )
                                              ? "bg-green-50"
                                              : ""
                                          }`}
                                        >
                                          {question.correctAnswers.includes(
                                            option
                                          ) ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                          ) : (
                                            <Circle className="h-4 w-4 text-gray-300" />
                                          )}
                                          <span>{option}</span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                            {question.explanation && (
                              <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                                <div className="font-medium">Explanation:</div>
                                <div>{question.explanation}</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border rounded-lg bg-white">
            <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
            <h4 className="text-sm font-medium">No content sections</h4>
            <p className="text-sm text-muted-foreground mt-1">
              This module doesn't have any content sections yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderFinalExamTab = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Final Exam</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive assessment for the entire course
          </p>
        </div>
        {finalExam._id && !isEditingFinalExam && (
          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={() => setIsEditingFinalExam(true)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Exam
            </Button>
          </div>
        )}
      </div>

      {isEditingFinalExam ? (
        <Card>
          <CardHeader>
            <CardTitle>Configure Final Exam</CardTitle>
            <CardDescription>
              Set up the exam parameters and questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="exam-title">Exam Title*</Label>
                <Input
                  id="exam-title"
                  placeholder="Final Exam"
                  value={finalExam.title}
                  onChange={(e) =>
                    setFinalExam({
                      ...finalExam,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exam-duration">Duration (minutes)*</Label>
                <Input
                  id="exam-duration"
                  type="number"
                  min="1"
                  value={finalExam.duration}
                  onChange={(e) =>
                    setFinalExam({
                      ...finalExam,
                      duration: parseInt(e.target.value) || 60,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passing-score">Passing Score (%)*</Label>
                <div className="relative">
                  <Input
                    id="passing-score"
                    type="number"
                    min="0"
                    max="100"
                    value={finalExam.passingScore}
                    onChange={(e) =>
                      setFinalExam({
                        ...finalExam,
                        passingScore: parseInt(e.target.value) || 70,
                      })
                    }
                  />
                  <div className="absolute right-3 top-2.5 text-muted-foreground text-sm">
                    %
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Total Questions</Label>
                <Input value={finalExam.questions.length} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exam-description">Description</Label>
              <Textarea
                id="exam-description"
                placeholder="Provide instructions or details about the exam"
                value={finalExam.description || ""}
                onChange={(e) =>
                  setFinalExam({
                    ...finalExam,
                    description: e.target.value,
                  })
                }
                rows={3}
              />
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-lg">Exam Questions</h3>
                <Badge variant="outline">
                  {finalExam.questions.length} questions
                </Badge>
              </div>

              {finalExam.questions.length > 0 ? (
                <div className="space-y-4">
                  {finalExam.questions.map((question, index) => (
                    <Card
                      key={index}
                      className="hover:shadow-sm transition-shadow"
                    >
                      <CardHeader className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              <span className="font-medium">Q{index + 1}</span>
                              <span>{question.questionText}</span>
                            </CardTitle>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="secondary">
                                {question.points} point
                                {question.points !== 1 ? "s" : ""}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleEditFinalExamQuestion(question, index)
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteFinalExamQuestion(index)
                              }
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`flex items-start gap-3 p-3 rounded-lg border ${
                                question.correctAnswer === option
                                  ? "bg-green-50 border-green-200"
                                  : "bg-muted/50"
                              }`}
                            >
                              <div className="flex items-center h-5 mt-0.5">
                                {question.correctAnswer === option ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Circle className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <div className="text-sm">{option}</div>
                            </div>
                          ))}
                        </div>
                        {question.explanation && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm">
                            <div className="font-medium text-blue-800">
                              Explanation:
                            </div>
                            <div className="text-blue-700">
                              {question.explanation}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 border rounded-lg bg-muted/50">
                  <FileQuestion className="h-10 w-10 text-muted-foreground mb-4" />
                  <h4 className="text-sm font-medium">
                    No questions added yet
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add your first question below
                  </p>
                </div>
              )}

              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {editingQuestionIndex !== null
                      ? "Edit Question"
                      : "Add New Question"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Question Text*</Label>
                    <Textarea
                      placeholder="Enter the question"
                      value={newFinalExamQuestion.questionText}
                      onChange={(e) =>
                        setNewFinalExamQuestion({
                          ...newFinalExamQuestion,
                          questionText: e.target.value,
                        })
                      }
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Options*</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {newFinalExamQuestion.options.map((option, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            placeholder={`Option ${i + 1}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [
                                ...newFinalExamQuestion.options,
                              ];
                              newOptions[i] = e.target.value;
                              setNewFinalExamQuestion({
                                ...newFinalExamQuestion,
                                options: newOptions,
                              });
                            }}
                          />
                          <Button
                            variant={
                              option === newFinalExamQuestion.correctAnswer
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            className="h-10 w-10 p-0"
                            onClick={() =>
                              setNewFinalExamQuestion({
                                ...newFinalExamQuestion,
                                correctAnswer: option,
                              })
                            }
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Points</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newFinalExamQuestion.points}
                        onChange={(e) =>
                          setNewFinalExamQuestion({
                            ...newFinalExamQuestion,
                            points: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Explanation (Optional)</Label>
                      <Input
                        placeholder="Add explanation for the answer"
                        value={newFinalExamQuestion.explanation || ""}
                        onChange={(e) =>
                          setNewFinalExamQuestion({
                            ...newFinalExamQuestion,
                            explanation: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    {editingQuestionIndex !== null && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setNewFinalExamQuestion({
                            questionText: "",
                            options: ["", "", "", ""],
                            correctAnswer: "",
                            points: 1,
                            explanation: "",
                          });
                          setEditingQuestionIndex(null);
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      onClick={handleAddFinalExamQuestion}
                      disabled={
                        !newFinalExamQuestion.questionText ||
                        !newFinalExamQuestion.correctAnswer ||
                        newFinalExamQuestion.options.some((opt) => !opt.trim())
                      }
                    >
                      {editingQuestionIndex !== null
                        ? "Update Question"
                        : "Add Question"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between">
              <div>
                {finalExam._id && (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteFinalExam}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Exam
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditingFinalExam(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveFinalExam}
                  disabled={
                    !finalExam.title ||
                    finalExam.questions.length === 0 ||
                    isSubmitting
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Final Exam
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{finalExam.title || "Final Exam"}</CardTitle>
                <CardDescription className="mt-1">
                  {finalExam.description || "Comprehensive course assessment"}
                </CardDescription>
              </div>
              {finalExam._id && (
                <Badge
                  variant={finalExam.isPublished ? "default" : "secondary"}
                >
                  {finalExam.isPublished ? "Published" : "Draft"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Duration</Label>
                <p className="font-medium">{finalExam.duration} minutes</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Passing Score</Label>
                <p className="font-medium">{finalExam.passingScore}%</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Total Questions</Label>
                <p className="font-medium">{finalExam.questions.length}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Status</Label>
                <p className="font-medium">
                  {finalExam._id ? "Configured" : "Not created"}
                </p>
              </div>
            </div>

            {finalExam.questions.length > 0 ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Sample Questions</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingFinalExam(true)}
                  >
                    {finalExam._id ? "Edit Exam" : "Create Exam"}
                  </Button>
                </div>

                <div className="space-y-4">
                  {finalExam.questions.slice(0, 3).map((question, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="font-medium flex items-start gap-2">
                        <span className="text-muted-foreground">
                          Q{index + 1}
                        </span>
                        <span>{question.questionText}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`flex items-start gap-3 p-2 rounded ${
                              question.correctAnswer === option
                                ? "bg-green-50"
                                : "bg-muted/30"
                            }`}
                          >
                            <div className="flex items-center h-5 mt-0.5">
                              {question.correctAnswer === option ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="text-sm">{option}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {finalExam.questions.length > 3 && (
                  <div className="text-center text-sm text-muted-foreground">
                    + {finalExam.questions.length - 3} more questions
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/30">
                <FileQuestion className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-sm font-medium">
                  {finalExam._id
                    ? "No questions added"
                    : "Final exam not created yet"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  {finalExam._id
                    ? "Add questions to the exam"
                    : "Create a final exam for this course"}
                </p>
                <Button onClick={() => setIsEditingFinalExam(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {finalExam._id ? "Add Questions" : "Create Final Exam"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderModuleForm = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {editingModuleId ? "Edit Module" : "Create New Module"}
        </h1>
        <Button variant="outline" onClick={handleBackToModules}>
          Back to Modules
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent>
          <div className="space-y-4 p-4 border rounded-lg mb-6 bg-white shadow-sm">
            <h3 className="font-medium text-lg">Module Details</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title*</label>
              <Input
                placeholder="Module title"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content*</label>
              <Textarea
                placeholder="Module description"
                value={moduleContent}
                onChange={(e) => setModuleContent(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isPublished" className="text-sm font-medium">
                Publish Module
              </label>
            </div>
          </div>

          {isAddingSection && (
            <div id="section-form">{renderSectionForm()}</div>
          )}

          {sections.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Module Sections</h3>
                <Button variant="outline" onClick={handleMainAddSectionClick}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </Button>
              </div>
              {sections.map((section) => renderSectionPreview(section))}
            </div>
          )}

          {sections.length === 0 && !isAddingSection && (
            <div className="flex flex-col items-center justify-center py-10 text-center bg-white rounded-lg border shadow-sm">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No content sections yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first content section to get started
              </p>
              <Button className="mt-4" onClick={() => setIsAddingSection(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Content Section
              </Button>
            </div>
          )}

          {(sections.length > 0 || isAddingSection) && (
            <div className="mt-6 flex justify-end gap-4">
              <Button variant="outline" onClick={handleBackToModules}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitModule}
                disabled={isSubmitting || sections.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingModuleId ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {editingModuleId ? "Update Module" : "Create Module"}
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <TutorSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3 bg-white">
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
                {course?.title ?? "Course"}
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Content</span>
            </div>
            {!showModuleForm && !selectedModule && (
              <Button onClick={handleCreateNewModule}>
                <Plus className="mr-2 h-4 w-4" />
                New Module
              </Button>
            )}
          </div>

          <div className="flex-1 p-8 bg-gray-50">
            {selectedModule ? (
              renderModuleDetails(selectedModule)
            ) : showModuleForm ? (
              renderModuleForm()
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold">Course Modules</h1>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4 mr-2" />
                      List
                    </Button>
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid className="h-4 w-4 mr-2" />
                      Grid
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search modules..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {loadingModules ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : filteredModules.length > 0 ? (
                  viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredModules.map(renderModuleCard)}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredModules.map((module) => (
                        <Card
                          key={module._id}
                          className="hover:shadow-md transition-shadow"
                        >
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  {module.title}
                                  {module.isPublished ? (
                                    <Badge variant="default">Published</Badge>
                                  ) : (
                                    <Badge variant="secondary">Draft</Badge>
                                  )}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                  {module.content.substring(0, 100)}
                                  {module.content.length > 100 ? "..." : ""}
                                </CardDescription>
                              </div>
                              <Badge variant="outline" className="ml-2">
                                Module {module.order}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between items-center">
                              <div className="text-sm text-muted-foreground">
                                {module.sections.length} sections
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleViewModule(module)}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditModule(module)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteModule(module._id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border shadow-sm">
                    <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">
                      No modules created yet
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create your first module to get started
                    </p>
                    <Button className="mt-4" onClick={handleCreateNewModule}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Module
                    </Button>
                  </div>
                )}

                {renderFinalExamTab()}

                {renderAssessmentTab()}
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
