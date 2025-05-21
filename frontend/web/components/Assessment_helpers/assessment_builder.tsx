// components/assessment-builder.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import debounce from "lodash.debounce";

const questionSchema = z.object({
  id: z.string(),
  questionType: z.enum(["multiple_choice"]),
  question: z.string().min(1, { message: "Question is required" }),
  options: z.array(z.string()).default([]),
  correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
  points: z.coerce.number().min(1, { message: "Points must be at least 1" }),
});

const assessmentSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  timeLimit: z.coerce
    .number()
    .min(1, { message: "Time limit must be at least 1 minute" }),
  passingScore: z.coerce
    .number()
    .min(1, { message: "Passing score must be at least 1%" })
    .max(100),
  questions: z
    .array(questionSchema)
    .min(1, { message: "At least one question is required" }),
});

export function AssessmentBuilder({
  type = "pre",
  value,
  onChange,
}: {
  type?: "pre" | "post";
  value: z.infer<typeof assessmentSchema>;
  onChange: (data: z.infer<typeof assessmentSchema>) => void;
}) {
  const { toast } = useToast();
  const [currentQuestionId, setCurrentQuestionId] = useState("1");
  const [isInitialized, setIsInitialized] = useState(false);

  const form = useForm({
    resolver: zodResolver(assessmentSchema),
    defaultValues: value,
  });

  useEffect(() => {
    if (value && !isInitialized) {
      form.reset(value);
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  // Debounce the onChange callback to prevent infinite loops
  const debouncedOnChange = useCallback(
    debounce((data: z.infer<typeof assessmentSchema>) => {
      onChange(data);
    }, 300),
    [onChange]
  );

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (isInitialized) {
        debouncedOnChange(values as z.infer<typeof assessmentSchema>);
      }
    });
    return () => {
      subscription.unsubscribe();
      debouncedOnChange.cancel();
    };
  }, [form.watch, debouncedOnChange, isInitialized]);

  const currentQuestion = form
    .watch("questions")
    ?.find((q) => q.id === currentQuestionId);

  const addQuestion = () => {
    const newId = (form.getValues("questions").length + 1).toString();
    form.setValue("questions", [
      ...form.getValues("questions"),
      {
        id: newId,
        questionType: "multiple_choice",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        points: 10,
      },
    ]);
    setCurrentQuestionId(newId);
  };

  const removeQuestion = (id: string) => {
    const questions = form.getValues("questions");
    if (questions.length <= 1) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must have at least one question",
      });
      return;
    }
    const updatedQuestions = questions.filter((q) => q.id !== id);
    form.setValue("questions", updatedQuestions);
    if (currentQuestionId === id) {
      setCurrentQuestionId(updatedQuestions[0].id);
    }
  };

  const updateQuestion = useCallback(
    (id: string, field: string, value: any) => {
      const questions = form.getValues("questions");
      form.setValue(
        "questions",
        questions.map((q) => {
          if (q.id !== id) return q;
          return { ...q, [field]: value };
        })
      );
    },
    [form]
  );

  const addOption = (questionId: string) => {
    const questions = form.getValues("questions");
    form.setValue(
      "questions",
      questions.map((q) =>
        q.id === questionId ? { ...q, options: [...(q.options || []), ""] } : q
      )
    );
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const questions = form.getValues("questions");
    form.setValue(
      "questions",
      questions.map((q) => {
        if (q.id !== questionId) return q;

        const currentOptions = q.options || [];
        if (currentOptions.length <= 2) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "You must have at least 2 options",
          });
          return q;
        }

        const updatedOptions = currentOptions.filter(
          (_, i) => i !== optionIndex
        );
        let updatedCorrectAnswer = q.correctAnswer;

        if (
          q.questionType === "multiple_choice" &&
          q.correctAnswer === optionIndex.toString()
        ) {
          updatedCorrectAnswer = "";
        }

        return {
          ...q,
          options: updatedOptions,
          correctAnswer: updatedCorrectAnswer,
        };
      })
    );
  };

  return (
    <Form {...form}>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{value.title} Details</CardTitle>
            <CardDescription>
              Set up the basic details for your {value.title.toLowerCase()}
            </CardDescription>
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
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      A clear title for your assessment
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide instructions for students
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                {form.watch("questions")?.map((q) => (
                  <Button
                    key={q.id}
                    variant={currentQuestionId === q.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setCurrentQuestionId(q.id)}
                  >
                    Question {q.id}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={addQuestion}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </CardContent>
          </Card>

          {currentQuestion && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Question {currentQuestionId}</CardTitle>
                  <CardDescription>Edit question details</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeQuestion(currentQuestionId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormItem>
                    <FormLabel>Question Type</FormLabel>
                    <Select
                      value={currentQuestion.questionType}
                      onValueChange={(value) =>
                        updateQuestion(currentQuestionId, "questionType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple_choice">
                          Multiple Choice
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                </div>
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <Textarea
                    value={currentQuestion.question}
                    onChange={(e) =>
                      updateQuestion(
                        currentQuestionId,
                        "question",
                        e.target.value
                      )
                    }
                    placeholder="Enter your question..."
                    className="min-h-[100px]"
                  />
                </FormItem>

                {currentQuestion.questionType === "multiple_choice" && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <FormLabel>Options</FormLabel>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(currentQuestionId)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Option
                      </Button>
                    </div>
                    <RadioGroup
                      value={
                        typeof currentQuestion.correctAnswer === "string"
                          ? currentQuestion.correctAnswer
                          : undefined
                      }
                      onValueChange={(value) =>
                        updateQuestion(
                          currentQuestionId,
                          "correctAnswer",
                          value
                        )
                      }
                    >
                      {currentQuestion.options?.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 mb-2"
                        >
                          <RadioGroupItem value={index.toString()} />
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [
                                ...(currentQuestion.options || []),
                              ];
                              newOptions[index] = e.target.value;
                              updateQuestion(
                                currentQuestionId,
                                "options",
                                newOptions
                              );
                            }}
                            placeholder={`Option ${index + 1}`}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              removeOption(currentQuestionId, index)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Form>
  );
}
