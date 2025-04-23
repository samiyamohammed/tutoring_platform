"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Plus, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { TutorSidebar } from "@/components/tutor-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

const questionSchema = z.object({
  id: z.string(),
  questionType: z.enum(["multiple_choice", "checkbox", "text", "true_false"]),
  question: z.string().min(1, { message: "Question is required" }),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
  points: z.coerce.number().min(1, { message: "Points must be at least 1" }),
})

const assessmentSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  timeLimit: z.coerce.number().min(1, { message: "Time limit must be at least 1 minute" }),
  passingScore: z.coerce
    .number()
    .min(1, { message: "Passing score must be at least 1%" })
    .max(100, { message: "Passing score cannot exceed 100%" }),
  assessmentType: z.enum(["pre", "post"]),
  questions: z.array(questionSchema).min(1, { message: "At least one question is required" }),
})

export default function CreateAssessmentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questions, setQuestions] = useState<z.infer<typeof questionSchema>[]>([
      {
        id: "1",
        questionType: "multiple_choice",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        points: 10,
      },
    ])
  const [currentQuestion, setCurrentQuestion] = useState("1")

  const form = useForm<z.infer<typeof assessmentSchema>>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      title: "",
      description: "",
      timeLimit: 30,
      passingScore: 70,
      assessmentType: "pre",
      questions: questions,
    },
  })

  const addQuestion = () => {
    const newId = (questions.length + 1).toString()
    const newQuestion: z.infer<typeof questionSchema> = {
      id: newId,
      questionType: "multiple_choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      points: 10,
    }
    setQuestions([...questions, newQuestion])
    setCurrentQuestion(newId)
  }

  const removeQuestion = (id: string) => {
    if (questions.length === 1) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must have at least one question",
      })
      return
    }

    const updatedQuestions = questions.filter((q) => q.id !== id)
    setQuestions(updatedQuestions)

    if (currentQuestion === id) {
      setCurrentQuestion(updatedQuestions[0].id)
    }
  }

  interface UpdateQuestionParams {
    id: string
    field: keyof z.infer<typeof questionSchema>
    value: any
  }

  const updateQuestion = ({ id, field, value }: UpdateQuestionParams) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === id) {
        return { ...q, [field]: value }
      }
      return q
    })
    setQuestions(updatedQuestions)
  }

  interface UpdateOptionParams {
    questionId: string
    optionIndex: number
    value: string
  }

  const updateOption = ({ questionId, optionIndex, value }: UpdateOptionParams) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        const updatedOptions = [...(q.options || [])]
        updatedOptions[optionIndex] = value
        return { ...q, options: updatedOptions }
      }
      return q
    })
    setQuestions(updatedQuestions)
  }

  interface AddOptionParams {
    questionId: string
  }

  const addOption = ({ questionId }: AddOptionParams) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        return { ...q, options: [...(q.options || []), ""] }
      }
      return q
    })
    setQuestions(updatedQuestions)
  }

  interface RemoveOptionParams {
    questionId: string
    optionIndex: number
  }

  const removeOption = ({ questionId, optionIndex }: RemoveOptionParams) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        if (q.options && q.options.length <= 2) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "You must have at least 2 options",
          })
          return q
        }

        const updatedOptions = q.options?.filter((_, index) => index !== optionIndex) || []
        let updatedCorrectAnswer = q.correctAnswer

        // If the removed option was the correct answer, reset the correct answer
        if (q.questionType === "multiple_choice" && q.correctAnswer === optionIndex.toString()) {
          updatedCorrectAnswer = ""
        } else if (q.questionType === "checkbox" && Array.isArray(q.correctAnswer)) {
          updatedCorrectAnswer = q.correctAnswer.filter((answer) => Number.parseInt(answer) !== optionIndex)
        }

        return { ...q, options: updatedOptions, correctAnswer: updatedCorrectAnswer }
      }
      return q
    })
    setQuestions(updatedQuestions)
  }

  const getCurrentQuestion = () => {
    return questions.find((q) => q.id === currentQuestion)
  }

  async function onSubmit(values: z.infer<typeof assessmentSchema>) {
    setIsSubmitting(true)

    try {
      // Prepare the data with the current questions state
      const formData = {
        ...values,
        questions: questions,
      }

      // This would be replaced with actual API call
      console.log(formData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Assessment created successfully",
        description: "Your assessment has been saved.",
      })

      // Redirect back to course creation
      router.push("/tutor/create-course")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create assessment. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <TutorSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">Create Assessment</h1>
              <p className="text-sm text-muted-foreground">Create pre or post assessments for your course</p>
            </div>
          </div>
          <div className="flex-1 space-y-4 p-8 pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Assessment Details</CardTitle>
                    <CardDescription>Set up the basic details for your assessment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assessment Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. JavaScript Fundamentals Pre-Assessment" {...field} />
                            </FormControl>
                            <FormDescription>A clear title for your assessment</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="assessmentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assessment Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select assessment type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pre">Pre-Assessment</SelectItem>
                                <SelectItem value="post">Post-Assessment</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Pre-assessments are taken before the course, post-assessments after completion
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assessment Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the purpose and content of this assessment..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Provide instructions and information about the assessment for students
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="timeLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time Limit (minutes)</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} {...field} />
                            </FormControl>
                            <FormDescription>Maximum time allowed to complete the assessment</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="passingScore"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Passing Score (%)</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} max={100} {...field} />
                            </FormControl>
                            <FormDescription>Minimum percentage required to pass the assessment</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-[300px_1fr]">
                  <Card className="h-fit">
                    <CardHeader>
                      <CardTitle>Questions</CardTitle>
                      <CardDescription>Manage assessment questions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {questions.map((q) => (
                          <Button
                            key={q.id}
                            variant={currentQuestion === q.id ? "default" : "outline"}
                            className="w-full justify-start"
                            onClick={() => setCurrentQuestion(q.id)}
                          >
                            Question {q.id}
                          </Button>
                        ))}
                      </div>
                      <Button variant="outline" className="w-full mt-4" onClick={addQuestion}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Question {currentQuestion}</CardTitle>
                        <CardDescription>Edit question details</CardDescription>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeQuestion(currentQuestion)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {getCurrentQuestion() && (
                        <>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <FormLabel>Question Type</FormLabel>
                              <Select
                                value={getCurrentQuestion()?.questionType ?? ""}
                                onValueChange={(value) => updateQuestion({ id: currentQuestion, field: "questionType", value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select question type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                  <SelectItem value="checkbox">Multiple Select</SelectItem>
                                  <SelectItem value="true_false">True/False</SelectItem>
                                  <SelectItem value="text">Text Answer</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-sm text-muted-foreground mt-1">Select the type of question</p>
                            </div>
                            <div>
                              <FormLabel>Points</FormLabel>
                              <Input
                                type="number"
                                min={1}
                                value={getCurrentQuestion()?.points ?? ""}
                                onChange={(e) =>
                                  updateQuestion({ id: currentQuestion, field: "points", value: Number.parseInt(e.target.value) })
                                }
                              />
                              <p className="text-sm text-muted-foreground mt-1">Points awarded for correct answer</p>
                            </div>
                          </div>

                          <div>
                            <FormLabel>Question</FormLabel>
                            <Textarea
                              value={getCurrentQuestion()?.question ?? ""}
                              onChange={(e) => updateQuestion({ id: currentQuestion, field: "question", value: e.target.value })}
                              placeholder="Enter your question here..."
                              className="min-h-[100px]"
                            />
                          </div>

                          {getCurrentQuestion()?.questionType === "multiple_choice" && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <FormLabel>Options</FormLabel>
                                <Button variant="outline" size="sm" onClick={() => addOption({ questionId: currentQuestion })}>
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Option
                                </Button>
                              </div>
                              <RadioGroup
                                value={
                                  Array.isArray(getCurrentQuestion()?.correctAnswer)
                                    ? undefined
                                    : getCurrentQuestion()?.correctAnswer
                                }
                                onValueChange={(value) => updateQuestion({ id: currentQuestion, field: "correctAnswer", value })}
                              >
                                {getCurrentQuestion()?.options?.map((option, index) => (
                                  <div key={index} className="flex items-center space-x-2 mb-2">
                                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                                    <div className="flex-1">
                                      <Input
                                        value={option}
                                        onChange={(e) => updateOption({ questionId: currentQuestion, optionIndex: index, value: e.target.value })}
                                        placeholder={`Option ${index + 1}`}
                                      />
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeOption({ questionId: currentQuestion, optionIndex: index })}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </RadioGroup>
                              <p className="text-sm text-muted-foreground mt-1">Select the correct answer</p>
                            </div>
                          )}

                          {getCurrentQuestion()?.questionType === "checkbox" && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <FormLabel>Options</FormLabel>
                                <Button variant="outline" size="sm" onClick={() => addOption({ questionId: currentQuestion })}>
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Option
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {getCurrentQuestion()?.options?.map((option, index) => (
                                  <div key={index} className="flex items-center space-x-2 mb-2">
                                    <Checkbox
                                      id={`checkbox-${index}`}
                                      checked={
                                        (Array.isArray(getCurrentQuestion()?.correctAnswer) &&
                                        getCurrentQuestion()?.correctAnswer?.includes(index.toString())) ?? false
                                      }
                                      onCheckedChange={(checked) => {
                                        const current = Array.isArray(getCurrentQuestion()?.correctAnswer)
                                          ? getCurrentQuestion()?.correctAnswer
                                          : []
                                        const updated = checked
                                          ? [...(current || []), index.toString()]
                                          : Array.isArray(current) ? current.filter((item) => item !== index.toString()) : []
                                        updateQuestion({ id: currentQuestion, field: "correctAnswer", value: updated })
                                      }}
                                    />
                                    <div className="flex-1">
                                      <Input
                                        value={option}
                                        onChange={(e) => updateOption({ questionId: currentQuestion, optionIndex: index, value: e.target.value })}
                                        placeholder={`Option ${index + 1}`}
                                      />
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeOption({ questionId: currentQuestion, optionIndex: index })}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">Select all correct answers</p>
                            </div>
                          )}

                          {getCurrentQuestion()?.questionType === "true_false" && (
                            <div>
                              <FormLabel>Correct Answer</FormLabel>
                              <RadioGroup
                                value={Array.isArray(getCurrentQuestion()?.correctAnswer) ? "" : getCurrentQuestion()?.correctAnswer ?? ""}
                                onValueChange={(value) => updateQuestion({ id: currentQuestion, field: "correctAnswer", value })}
                                className="flex flex-col space-y-1 mt-2"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="true" id="true" />
                                  <FormLabel htmlFor="true">True</FormLabel>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="false" id="false" />
                                  <FormLabel htmlFor="false">False</FormLabel>
                                </div>
                              </RadioGroup>
                            </div>
                          )}

                          {getCurrentQuestion()?.questionType === "text" && (
                            <div>
                              <FormLabel>Sample Answer (for grading reference)</FormLabel>
                              <Textarea
                                value={getCurrentQuestion()?.correctAnswer ?? ""}
                                onChange={(e) => updateQuestion({ id: currentQuestion, field: "correctAnswer", value: e.target.value })}
                                placeholder="Enter a sample correct answer..."
                                className="min-h-[100px]"
                              />
                              <p className="text-sm text-muted-foreground mt-1">
                                This will be used as a reference for manual grading
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end gap-4">
                  <Button variant="outline" type="button" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Saving..." : "Save Assessment"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
