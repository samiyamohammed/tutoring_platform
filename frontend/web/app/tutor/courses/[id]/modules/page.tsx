"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
    Plus, Edit, Trash2, ChevronRight, BookOpen, Video, FileText,
    Save, X, ListChecks, FileQuestion, MoveUp, MoveDown, CheckCircle,
    Check, Circle, Type, List, MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { TutorSidebar } from "@/components/tutor-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type ContentType = 'video' | 'text'
type QuestionType = 'mcq' | 'true_false' | 'fill_blank'

interface Module {
    _id: string
    title: string
    description: string
    content: string
    type: ContentType
    duration: number
    isPublished: boolean
    order: number
    createdAt: Date
    updatedAt: Date
}

interface Quiz {
    _id: string
    title: string
    order: number
    duration: number
    gradingDate: Date
    questions: Question[]
    isPublished: boolean
    createdAt: Date
    updatedAt: Date
}

interface Question {
    questionText: string
    questionType: QuestionType  // Changed from 'type' to 'questionType'
    options?: string[]
    correctAnswer: string
    points: number  // Note: This isn't in your schema - you may want to add it
}

const DEFAULT_MODULE: Partial<Module> = {
    title: '',
    description: '',
    content: '',
    type: 'text',
    duration: 0,
    isPublished: false
}

const DEFAULT_QUIZ: Partial<Quiz> = {
    title: '',
    duration: 30,
    gradingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    questions: [],
    isPublished: false
}

const DEFAULT_QUESTION: Partial<Question> = {
    questionText: '',
    questionType: 'mcq',  // Changed from 'type' to 'questionType'
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1
}

interface Course {
    _id: string
    title: string
    description: string
    modules: Module[]
    quizzes: Quiz[]
}

export default function CourseContentPage() {
    const params = useParams()
    const courseId = params.id as string
    const [course, setCourse] = useState<Course | null>(null)
    const [content, setContent] = useState<(Module | Quiz)[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()
    const [editingItem, setEditingItem] = useState<Module | Quiz | null>(null)
    const [newItem, setNewItem] = useState<Partial<Module | Quiz>>(DEFAULT_MODULE)
    const [isAddingItem, setIsAddingItem] = useState(false)
    const [contentType, setContentType] = useState<'module' | 'quiz'>('module')
    const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null)
    const [newQuestion, setNewQuestion] = useState<Partial<Question>>({ ...DEFAULT_QUESTION })

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem("token") || '' : ''

                console.log('Fetching content for course:', courseId)
                console.log('Token:', token)

                const [courseRes] = await Promise.all([
                    fetch(`http://localhost:5000/api/course/${courseId}`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    })
                ]);

                if (!courseRes.ok) throw new Error('Failed to fetch content')

                const courseData = await courseRes.json()
                setCourse(courseData)

                const modules = await courseData.modules
                const quizzes = await courseData.quizzes

                const combined = [...modules, ...quizzes].sort((a, b) => a.order - b.order)
                setContent(combined)
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to fetch content",
                })
            } finally {
                setLoading(false)
            }
        }

        fetchContent()
    }, [courseId, toast])

    const handleAddItem = async () => {
        if (!newItem.title?.trim()) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Title is required",
            })
            return
        }

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem("token") || '' : ''
            const endpoint = `http://localhost:5000/api/course/${courseId}`

            const addedItem = contentType === 'module'
                ?
                {
                    ...newItem,
                    order: content.length + 1 // Assign new order
                }


                :
                {
                    title: newItem.title,
                    course: courseId,
                    order: content.length + 1, // Assign new order
                    duration: newItem.duration,
                    gradingDate: 'gradingDate' in newItem ? newItem.gradingDate || undefined : undefined,
                    questions: 'questions' in newItem ? newItem.questions || [] : [],
                    isPublished: newItem.isPublished || false
                }

            const payload = contentType === 'module'
                ? {
                    modules: [
                        ...(course?.modules || []),
                        {
                            ...newItem,
                            order: content.length + 1 // Assign new order
                        }
                    ]
                }
                : {
                    quizzes: [
                        ...(course?.quizzes || []),
                        {
                            title: newItem.title,
                            course: courseId,
                            order: content.length + 1, // Assign new order
                            duration: newItem.duration,
                            gradingDate: 'gradingDate' in newItem ? newItem.gradingDate || undefined : undefined,
                            questions: 'questions' in newItem ? newItem.questions || [] : [],
                            isPublished: newItem.isPublished || false
                        }
                    ]
                }

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })

            if (!response.ok) throw new Error(`Failed to add ${contentType}`)


            setContent(
                [...content, addedItem as Module | Quiz].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            );

            resetItemForm()
            toast({
                title: "Success",
                description: `${contentType === 'module' ? 'Module' : 'Quiz'} added successfully`,
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : `Failed to add ${contentType}`,
            })
        }
    }

    const handleUpdateItem = async () => {
        if (!editingItem || !editingItem.title?.trim()) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Title is required",
            })
            return
        }

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem("token") || '' : ''
            const isQuiz = 'questions' in editingItem
            const endpoint = `http://localhost:5000/api/course/${editingItem._id}`

            const payload = isQuiz
                ? {
                    quizzes: {
                        title: editingItem.title,
                        duration: editingItem.duration,
                        gradingDate: editingItem.gradingDate,
                        questions: editingItem.questions,
                        isPublished: editingItem.isPublished
                    }
                }
                : editingItem

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })

            if (!response.ok) throw new Error(`Failed to update ${isQuiz ? 'quiz' : 'module'}`)

            const updatedItem = await response.json()
            setContent(content.map(item =>
                item._id === editingItem._id ? updatedItem : item
            ))
            setEditingItem(null)
            toast({
                title: "Success",
                description: `${isQuiz ? 'Quiz' : 'Module'} updated successfully`,
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : `Failed to update item`,
            })
        }
    }

    const handleDeleteItem = async (itemId: string, isQuiz: boolean) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem("token") || '' : ''
            const endpoint = `http://localhost:5000/course/module/${courseId}`

            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(itemId)
            })

            if (!response.ok) throw new Error(`Failed to delete ${isQuiz ? 'quiz' : 'module'}`)

            setContent(content.filter(item => item._id !== itemId))
            toast({
                title: "Success",
                description: `${isQuiz ? 'Quiz' : 'Module'} deleted successfully`,
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : `Failed to delete item`,
            })
        }
    }

    const handleReorder = (direction: 'up' | 'down', itemId: string) => {
        const index = content.findIndex(item => item._id === itemId)
        if (index === -1) return

        const newContent = [...content]

        if (direction === 'up' && index > 0) {
            const temp = newContent[index].order
            newContent[index].order = newContent[index - 1].order
            newContent[index - 1].order = temp
        } else if (direction === 'down' && index < content.length - 1) {
            const temp = newContent[index].order
            newContent[index].order = newContent[index + 1].order
            newContent[index + 1].order = temp
        } else {
            return
        }

        setContent(newContent.sort((a, b) => a.order - b.order))
        // TODO: Add API call to save new order
    }

    const resetItemForm = () => {
        setNewItem(contentType === 'module' ? { ...DEFAULT_MODULE } : { ...DEFAULT_QUIZ })
        setIsAddingItem(false)
        setEditingQuestionIndex(null)
        setNewQuestion({ ...DEFAULT_QUESTION })
    }

    const handleAddQuestion = () => {
        if (!newQuestion.questionText?.trim()) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Question text is required",
            });
            return;
        }

        if (!newQuestion.correctAnswer?.trim()) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Correct answer is required",
            });
            return;
        }

        // Prepare the question data according to the schema
        const questionData = {
            questionText: newQuestion.questionText,
            questionType: newQuestion.questionType,
            correctAnswer: newQuestion.correctAnswer,
            options: newQuestion.options,
            points: newQuestion.points // Only include if added to your schema
        };

        if (editingItem && 'questions' in editingItem) {
            const updatedQuiz = { ...editingItem };

            if (editingQuestionIndex !== null) {
                updatedQuiz.questions[editingQuestionIndex] = questionData as Question;
            } else {
                updatedQuiz.questions.push(questionData as Question);
            }

            setEditingItem(updatedQuiz);
            setEditingQuestionIndex(null);
            setNewQuestion({ ...DEFAULT_QUESTION });
        } else if (isAddingItem && 'questions' in newItem) {
            const updatedQuiz = {
                ...newItem,
                questions: [...(newItem.questions || []), questionData as Question]
            };
            setNewItem(updatedQuiz);
            setNewQuestion({ ...DEFAULT_QUESTION });
        }
    };

    const handleRemoveQuestion = (index: number) => {
        if (editingItem && 'questions' in editingItem) {
            const updatedQuiz = { ...editingItem }
            updatedQuiz.questions.splice(index, 1)
            setEditingItem(updatedQuiz)
        } else if (isAddingItem && 'questions' in newItem) {
            const updatedQuiz = { ...newItem }
            updatedQuiz.questions?.splice(index, 1)
            setNewItem(updatedQuiz)
        }
    }

    const getContentTypeIcon = (item: Module | Quiz) => {
        if ('questions' in item) {
            return <FileQuestion className="h-4 w-4" />
        } else {
            return item.type === 'video' ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />
        }
    }

    const renderQuestionForm = () => {
        return (
            <div className="space-y-4 p-4 border rounded-lg mb-4">
                <div className="flex justify-between items-center">
                    <h4 className="font-medium">
                        {editingQuestionIndex !== null ? 'Edit Question' : 'Add New Question'}
                    </h4>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setEditingQuestionIndex(null)
                            setNewQuestion({ ...DEFAULT_QUESTION })
                        }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Question Type</label>
                    <Select
                        value={newQuestion.questionType}  // Changed from 'type' to 'questionType'
                        onValueChange={(value) => setNewQuestion({
                            ...newQuestion,
                            questionType: value as QuestionType,  // Changed from 'type' to 'questionType'
                            options: value === 'true_false' ? ['True', 'False'] : ['', '', '', ''],
                            correctAnswer: value === 'true_false' ? 'True' : ''
                        })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="mcq">Multiple Choice</SelectItem>
                            <SelectItem value="true_false">True/False</SelectItem>
                            <SelectItem value="fill_blank">Fill in the Blank</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Question Text*</label>
                    <Input
                        placeholder="Enter the question"
                        value={newQuestion.questionText || ''}
                        onChange={(e) => setNewQuestion({
                            ...newQuestion,
                            questionText: e.target.value
                        })}
                    />
                </div>

                {newQuestion.questionType !== 'fill_blank' && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Options*</label>
                        {newQuestion.options?.map((option, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <Input
                                    placeholder={`Option ${i + 1}`}
                                    value={option}
                                    onChange={(e) => {
                                        const newOptions = [...(newQuestion.options || [])]
                                        newOptions[i] = e.target.value
                                        setNewQuestion({
                                            ...newQuestion,
                                            options: newOptions
                                        })
                                    }}
                                />
                                <Button
                                    variant={newQuestion.correctAnswer === option ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setNewQuestion({
                                        ...newQuestion,
                                        correctAnswer: option
                                    })}
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {newQuestion.questionType === 'fill_blank' && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Correct Answer*</label>
                        <Input
                            placeholder="Enter the correct answer"
                            value={newQuestion.correctAnswer || ''}
                            onChange={(e) => setNewQuestion({
                                ...newQuestion,
                                correctAnswer: e.target.value
                            })}
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium">Points</label>
                    <Input
                        type="number"
                        placeholder="Points for this question"
                        value={newQuestion.points || 1}
                        onChange={(e) => setNewQuestion({
                            ...newQuestion,
                            points: parseInt(e.target.value) || 1
                        })}
                    />
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleAddQuestion}>
                        {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
                    </Button>
                </div>
            </div>
        )
    }

    const renderQuestionsList = (questions: Question[]) => {
        return (
            <div className="space-y-4">
                <h4 className="font-medium">Quiz Questions</h4>
                {questions.length > 0 ? (
                    <div className="space-y-4">
                        {questions.map((question, index) => (
                            <div key={index} className="border rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">
                                            {index + 1}. {question.questionType === 'mcq' ? 'MCQ' :
                                                question.questionType === 'true_false' ? 'True/False' : 'Fill Blank'}
                                        </span>
                                        <Badge variant="secondary">
                                            {question.points} point{question.points !== 1 ? 's' : ''}
                                        </Badge>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setEditingQuestionIndex(index)
                                                setNewQuestion(question)
                                            }}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveQuestion(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-sm mb-2">{question.questionText}</p>

                                {question.questionType !== 'fill_blank' && (
                                    <div className="space-y-1">
                                        {question.options?.map((option, i) => (
                                            <div
                                                key={i}
                                                className={`flex items-center gap-2 p-2 rounded ${question.correctAnswer === option ? 'bg-green-50' : ''}`}
                                            >
                                                <Circle className="h-3 w-3" />
                                                <span className="text-sm">{option}</span>
                                                {question.correctAnswer === option && (
                                                    <Check className="h-3 w-3 text-green-500" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {question.questionType === 'fill_blank' && (
                                    <div className="bg-green-50 p-2 rounded">
                                        <span className="text-sm font-medium">Correct Answer:</span>
                                        <p className="text-sm">{question.correctAnswer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                        No questions added yet
                    </div>
                )}
            </div>
        )
    }

    if (loading) {
        return (
            <SidebarProvider>
                <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
                    <TutorSidebar />
                    <main className="flex flex-col">
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <div className="flex items-center gap-2">
                                <Link href="/tutor/courses" className="text-sm text-muted-foreground hover:text-foreground">
                                    Courses
                                </Link>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Loading...</span>
                            </div>
                        </div>
                        <div className="flex-1 flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    </main>
                </div>
            </SidebarProvider>
        )
    }

    return (
        <SidebarProvider>
            <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
                <TutorSidebar />
                <main className="flex flex-col">
                    <div className="flex items-center justify-between border-b px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Link href="/tutor/courses" className="text-sm text-muted-foreground hover:text-foreground">
                                Courses
                            </Link>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            <Link href={`/tutor/courses/${courseId}`} className="text-sm text-muted-foreground hover:text-foreground">
                                {courseId}
                            </Link>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Content</span>
                        </div>
                        <div className="flex gap-2">
                            <Select value={contentType} onValueChange={(value) => setContentType(value as 'module' | 'quiz')}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="module">Module</SelectItem>
                                    <SelectItem value="quiz">Quiz</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={() => {
                                setIsAddingItem(true)
                                setNewItem(contentType === 'module' ? { ...DEFAULT_MODULE } : { ...DEFAULT_QUIZ })
                            }}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add {contentType === 'module' ? 'Module' : 'Quiz'}
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 p-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Content</CardTitle>
                                <CardDescription>Manage all learning content for this course</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Add/Edit Form */}
                                {(isAddingItem || editingItem) && (
                                    <div className="mb-6 rounded-lg border p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-medium">
                                                {editingItem
                                                    ? `Edit ${'questions' in editingItem ? 'Quiz' : 'Module'}`
                                                    : `Add New ${contentType === 'module' ? 'Module' : 'Quiz'}`}
                                            </h3>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => editingItem ? setEditingItem(null) : resetItemForm()}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <Tabs defaultValue="basic" className="w-full">
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                                <TabsTrigger value="content">
                                                    {'questions' in (editingItem || newItem) ? 'Questions' : 'Content'}
                                                </TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="basic">
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Title*</label>
                                                        <Input
                                                            placeholder={`${contentType === 'module' ? 'Module' : 'Quiz'} Title`}
                                                            value={
                                                                editingItem
                                                                    ? editingItem.title
                                                                    : contentType === 'module'
                                                                        ? (newItem as Partial<Module>).title || ''
                                                                        : (newItem as Partial<Quiz>).title || ''
                                                            }
                                                            onChange={(e) => {
                                                                if (editingItem) {
                                                                    setEditingItem({ ...editingItem, title: e.target.value })
                                                                } else {
                                                                    setNewItem({ ...newItem, title: e.target.value })
                                                                }
                                                            }}
                                                        />
                                                    </div>

                                                    {'type' in (editingItem || newItem) ? (
                                                        <>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium">Description</label>
                                                                <Textarea
                                                                    placeholder="Description"
                                                                    value={
                                                                        editingItem
                                                                            ? (editingItem as Module).description
                                                                            : (newItem as Partial<Module>).description || ''
                                                                    }
                                                                    onChange={(e) => {
                                                                        if (editingItem) {
                                                                            setEditingItem({
                                                                                ...editingItem as Module,
                                                                                description: e.target.value
                                                                            })
                                                                        } else {
                                                                            setNewItem({
                                                                                ...newItem as Partial<Module>,
                                                                                description: e.target.value
                                                                            })
                                                                        }
                                                                    }}
                                                                    rows={3}
                                                                />
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium">Content Type</label>
                                                                    <Select
                                                                        value={
                                                                            editingItem
                                                                                ? (editingItem as Module).type
                                                                                : (newItem as Partial<Module>).type || 'text'
                                                                        }
                                                                        onValueChange={(value) => {
                                                                            if (editingItem) {
                                                                                setEditingItem({
                                                                                    ...editingItem as Module,
                                                                                    type: value as ContentType
                                                                                })
                                                                            } else {
                                                                                setNewItem({
                                                                                    ...newItem as Partial<Module>,
                                                                                    type: value as ContentType
                                                                                })
                                                                            }
                                                                        }}
                                                                    >
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select type" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="text">Text</SelectItem>
                                                                            <SelectItem value="video">Video</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium">Duration (minutes)</label>
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="Estimated duration"
                                                                        value={
                                                                            editingItem
                                                                                ? (editingItem as Module).duration || 0
                                                                                : (newItem as Partial<Module>).duration || 0
                                                                        }
                                                                        onChange={(e) => {
                                                                            if (editingItem) {
                                                                                setEditingItem({
                                                                                    ...editingItem as Module,
                                                                                    duration: parseInt(e.target.value) || 0
                                                                                })
                                                                            } else {
                                                                                setNewItem({
                                                                                    ...newItem as Partial<Module>,
                                                                                    duration: parseInt(e.target.value) || 0
                                                                                })
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium">Duration (minutes)</label>
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="Quiz duration"
                                                                        value={
                                                                            editingItem
                                                                                ? (editingItem as Quiz).duration
                                                                                : (newItem as Partial<Quiz>).duration || 30
                                                                        }
                                                                        onChange={(e) => {
                                                                            if (editingItem) {
                                                                                setEditingItem({
                                                                                    ...editingItem as Quiz,
                                                                                    duration: parseInt(e.target.value) || 30
                                                                                })
                                                                            } else {
                                                                                setNewItem({
                                                                                    ...newItem as Partial<Quiz>,
                                                                                    duration: parseInt(e.target.value) || 30
                                                                                })
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium">Grading Date</label>
                                                                    <Popover>
                                                                        <PopoverTrigger asChild>
                                                                            <Button
                                                                                variant="outline"
                                                                                className="w-full justify-start text-left font-normal"
                                                                            >
                                                                                {format(
                                                                                    editingItem
                                                                                        ? (editingItem as Quiz).gradingDate
                                                                                        : (newItem as Partial<Quiz>).gradingDate || new Date(),
                                                                                    "PPP"
                                                                                )}
                                                                            </Button>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent className="w-auto p-0">
                                                                            <Calendar
                                                                                mode="single"
                                                                                selected={
                                                                                    editingItem
                                                                                        ? (editingItem as Quiz).gradingDate
                                                                                        : (newItem as Partial<Quiz>).gradingDate || new Date()
                                                                                }
                                                                                onSelect={(date) => {
                                                                                    if (date) {
                                                                                        if (editingItem) {
                                                                                            setEditingItem({
                                                                                                ...editingItem as Quiz,
                                                                                                gradingDate: date
                                                                                            })
                                                                                        } else {
                                                                                            setNewItem({
                                                                                                ...newItem as Partial<Quiz>,
                                                                                                gradingDate: date
                                                                                            })
                                                                                        }
                                                                                    }
                                                                                }}
                                                                                initialFocus
                                                                            />
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}

                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id="publish"
                                                            checked={
                                                                editingItem
                                                                    ? editingItem.isPublished
                                                                    : newItem.isPublished || false
                                                            }
                                                            onChange={(e) => {
                                                                if (editingItem) {
                                                                    setEditingItem({
                                                                        ...editingItem,
                                                                        isPublished: e.target.checked
                                                                    })
                                                                } else {
                                                                    setNewItem({
                                                                        ...newItem,
                                                                        isPublished: e.target.checked
                                                                    })
                                                                }
                                                            }}
                                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        <label htmlFor="publish" className="text-sm font-medium">
                                                            Publish this {editingItem ? ('questions' in editingItem ? 'quiz' : 'module') : contentType}
                                                        </label>
                                                    </div>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="content">
                                                {'questions' in (editingItem || newItem) ? (
                                                    <div className="space-y-4">
                                                        {renderQuestionForm()}

                                                        {editingItem ? (
                                                            renderQuestionsList((editingItem as Quiz).questions)
                                                        ) : (
                                                            renderQuestionsList((newItem as Partial<Quiz>).questions || [])
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium">
                                                                {editingItem && (editingItem as Module).type === 'video' ? 'Video URL' : 'Content'}
                                                            </label>
                                                            <Textarea
                                                                placeholder={
                                                                    editingItem && (editingItem as Module).type === 'video'
                                                                        ? 'Enter video URL or embed code'
                                                                        : 'Enter module content'
                                                                }
                                                                value={
                                                                    editingItem
                                                                        ? (editingItem as Module).content
                                                                        : (newItem as Partial<Module>).content || ''
                                                                }
                                                                onChange={(e) => {
                                                                    if (editingItem) {
                                                                        setEditingItem({
                                                                            ...editingItem as Module,
                                                                            content: e.target.value
                                                                        })
                                                                    } else {
                                                                        setNewItem({
                                                                            ...newItem as Partial<Module>,
                                                                            content: e.target.value
                                                                        })
                                                                    }
                                                                }}
                                                                rows={8}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </TabsContent>
                                        </Tabs>

                                        <div className="flex justify-end gap-2 pt-4">
                                            <Button
                                                variant="outline"
                                                onClick={() => editingItem ? setEditingItem(null) : resetItemForm()}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={editingItem ? handleUpdateItem : handleAddItem}
                                                disabled={
                                                    editingItem
                                                        ? !editingItem.title?.trim() ||
                                                        ('questions' in editingItem && editingItem.questions.length === 0)
                                                        : !newItem.title?.trim() ||
                                                        ('questions' in newItem && (newItem as Partial<Quiz>).questions?.length === 0)
                                                }
                                            >
                                                <Save className="mr-2 h-4 w-4" />
                                                {editingItem ? "Save Changes" : `Add ${contentType === 'module' ? 'Module' : 'Quiz'}`}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Content List */}
                                {content.length > 0 ? (
                                    <div className="space-y-4">
                                        {content.map((item) => (
                                            <div key={item._id} className="rounded-lg border">
                                                <div className="flex items-center justify-between p-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sm font-medium">
                                                            {item.order}
                                                        </span>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-medium">{item.title}</h3>
                                                                {item.isPublished && (
                                                                    <Badge variant="default" className="flex items-center gap-1">
                                                                        <CheckCircle className="h-3 w-3" />
                                                                        Published
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {'description' in item && item.description && (
                                                                <p className="text-sm text-muted-foreground line-clamp-1">
                                                                    {item.description}
                                                                </p>
                                                            )}
                                                            {'gradingDate' in item && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    Grading: {format(item.gradingDate, "PPP")}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary" className="flex items-center gap-1">
                                                            {getContentTypeIcon(item)}
                                                            {'questions' in item ? 'Quiz' : (item as Module).type === 'video' ? 'Video' : 'Text'}
                                                            {'duration' in item && ` • ${item.duration} min`}
                                                        </Badge>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setEditingItem(item)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent>
                                                                <DropdownMenuItem onClick={() => handleReorder('up', item._id)}>
                                                                    <MoveUp className="mr-2 h-4 w-4" />
                                                                    Move Up
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleReorder('down', item._id)}>
                                                                    <MoveDown className="mr-2 h-4 w-4" />
                                                                    Move Down
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-red-600"
                                                                    onClick={() => handleDeleteItem(item._id, 'questions' in item)}
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete {'questions' in item ? 'Quiz' : 'Module'}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                                {'content' in item && item.content && (
                                                    <div className="border-t p-4">
                                                        {item.type === 'video' ? (
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Video className="h-4 w-4" />
                                                                <span>{item.content}</span>
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm line-clamp-3">{item.content}</p>
                                                        )}
                                                    </div>
                                                )}
                                                {'questions' in item && item.questions.length > 0 && (
                                                    <div className="border-t p-4">
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <FileQuestion className="h-4 w-4" />
                                                            <span>{item.questions.length} question{item.questions.length !== 1 ? 's' : ''}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium">No content yet</h3>
                                        <p className="text-sm text-muted-foreground mt-1">Add your first module or quiz to get started</p>
                                        <div className="flex gap-2 mt-4">
                                            <Button onClick={() => {
                                                setContentType('module')
                                                setIsAddingItem(true)
                                                setNewItem({ ...DEFAULT_MODULE })
                                            }}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Module
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setContentType('quiz')
                                                    setIsAddingItem(true)
                                                    setNewItem({ ...DEFAULT_QUIZ })
                                                }}
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Quiz
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    )
}