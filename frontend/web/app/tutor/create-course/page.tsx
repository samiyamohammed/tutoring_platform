"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, DollarSign, Plus, Trash2, Loader2 } from "lucide-react"
import debounce from "lodash.debounce"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { TutorSidebar } from "@/components/tutor-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  level: z.string({
    required_error: "Please select a difficulty level.",
  }),
  deadline: z.date({
    required_error: "Please select a completion deadline.",
  }),
  sessionTypes: z.array(z.string()).min(1, {
    message: "At least one session type is required.",
  }),
  pricing: z.object({
    online: z.object({
      price: z.coerce.number().min(0, {
        message: "Price cannot be negative.",
      }),
      maxStudents: z.coerce.number().min(1, {
        message: "At least 1 student is required for online sessions.",
      }),
      schedule: z.array(z.object({
        day: z.string(),
        startTime: z.string(),
        endTime: z.string(),
      })).min(0),
    }).optional(),
    group: z.object({
      price: z.coerce.number().min(0, {
        message: "Price cannot be negative.",
      }),
      maxStudents: z.coerce.number().min(1, {
        message: "At least 1 student is required for group sessions.",
      }),
      schedule: z.array(z.object({
        day: z.string(),
        startTime: z.string(),
        endTime: z.string(),
      })).min(1),
    }).optional(),
    oneOnOne: z.object({
      price: z.coerce.number().min(0, {
        message: "Price cannot be negative.",
      }),
      maxStudents: z.coerce.number().min(1, {
        message: "At least 1 student is required for one-on-one sessions.",
      }),
      schedule: z.array(z.object({
        day: z.string(),
        startTime: z.string(),
        endTime: z.string(),
      })).min(1),
    }).optional(),
  }),
})

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
]

const sessionTypes = [
  { id: "online", label: "Online Course" },
  { id: "group", label: "Group Sessions" },
  { id: "oneOnOne", label: "One-on-One Sessions" },
]

export default function CreateCoursePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ; 


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      level: "",
      deadline: undefined,
      sessionTypes: ["online"],
      pricing: {
        online: {
          price: 49.99,
          maxStudents: 100,
          schedule: [{ day: "Monday", startTime: "09:00", endTime: "10:00" }]
        },
        group: {
          price: 0,
          maxStudents: 10,
          schedule: []
        },
        oneOnOne: {
          price: 0,
          maxStudents: 1,
          schedule: []
        }
      },
    },
    mode: "onBlur",
  })

  const watchSessionTypes = form.watch("sessionTypes")

  // Memoize expensive computations
  const onlineSchedule = useMemo(() => form.watch("pricing.online.schedule"), [form])
  const groupSchedule = useMemo(() => form.watch("pricing.group.schedule"), [form])
  const oneOnOneSchedule = useMemo(() => form.watch("pricing.oneOnOne.schedule"), [form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    try {
      const payload = {
        title: values.title,
        description: values.description,
        category: values.category,
        level: values.level,
        deadline: new Date(values.deadline),
        sessionTypes: values.sessionTypes,
        pricing: {
          ...(values.sessionTypes.includes("online") && values.pricing.online && {
            online: {
              price: values.pricing.online.price,
              maxStudents: values.pricing.online.maxStudents,
              schedule: values.pricing.online.schedule.map(schedule => ({
                day: schedule.day,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
              })),
            },
          }),
          ...(values.sessionTypes.includes("group") && values.pricing.group && {
            group: {
              price: values.pricing.group.price,
              maxStudents: values.pricing.group.maxStudents,
              schedule: values.pricing.group.schedule.map(schedule => ({
                day: schedule.day,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
              })),
            },
          }),
          ...(values.sessionTypes.includes("oneOnOne") && values.pricing.oneOnOne && {
            oneOnOne: {
              price: values.pricing.oneOnOne.price,
              maxStudents: values.pricing.oneOnOne.maxStudents,
              schedule: values.pricing.oneOnOne.schedule.map(schedule => ({
                day: schedule.day,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
              })),
            },
          }),
        },
      };
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") || '' : '';
      
      const response = await fetch(`${apiUrl}/api/course`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create course');
      }

      const data = await response.json();
      toast({
        title: "Course created successfully",
        description: "Your new course has been created and is ready for content.",
      });
      router.push(`/tutor/dashboard`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create course",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addScheduleItem = (sessionType: "online" | "group" | "oneOnOne") => {
    const currentSchedules = form.getValues(`pricing.${sessionType}.schedule`) || []
    form.setValue(`pricing.${sessionType}.schedule`, [
      ...currentSchedules,
      { day: "Monday", startTime: "09:00", endTime: "10:00" }
    ], { shouldValidate: true })
  }

  const removeScheduleItem = (sessionType: "online" | "group" | "oneOnOne", index: number) => {
    const currentSchedules = form.getValues(`pricing.${sessionType}.schedule`) || []
    if (currentSchedules.length <= 1) {
      if (sessionType === "group" || sessionType === "oneOnOne") {
        return
      }
    }
    const newSchedules = currentSchedules.filter((_, i) => i !== index)
    form.setValue(`pricing.${sessionType}.schedule`, newSchedules, { shouldValidate: true })
  }

  const handleInputChange = debounce((field: string, value: any) => {
    form.setValue(field as any, value, { shouldValidate: true })
  }, 300)

  useEffect(() => {
    return () => {
      handleInputChange.cancel()
    }
  }, [handleInputChange])

  const renderScheduleFields = (sessionType: "online" | "group" | "oneOnOne") => {
    const schedules = form.watch(`pricing.${sessionType}.schedule`) || []
    
    return (
      <div className="space-y-3">
        {schedules.map((_, index) => (
          <div key={index} className="flex flex-col gap-2 p-3 border rounded-md">
            <div className="flex items-center gap-2">
              <FormField
                control={form.control}
                name={`pricing.${sessionType}.schedule.${index}.day`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        handleInputChange(`pricing.${sessionType}.schedule.${index}.day`, value)
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {daysOfWeek.map(day => (
                          <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeScheduleItem(sessionType, index)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name={`pricing.${sessionType}.schedule.${index}.startTime`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          handleInputChange(`pricing.${sessionType}.schedule.${index}.startTime`, e.target.value)
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`pricing.${sessionType}.schedule.${index}.endTime`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          handleInputChange(`pricing.${sessionType}.schedule.${index}.endTime`, e.target.value)
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="mt-2"
          onClick={() => addScheduleItem(sessionType)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Time Slot
        </Button>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <TutorSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">Create New Course</h1>
              <p className="text-sm text-muted-foreground">Set up your course details and structure</p>
            </div>
          </div>
          <div className="flex-1 space-y-4 p-8 pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic Information</TabsTrigger>
                    <TabsTrigger value="sessions">Session Types</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing & Schedule</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Enter the basic details about your course</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="course-title">Course Title</FormLabel>
                              <FormControl>
                                <Input
                                  id="course-title"
                                  placeholder="e.g. Advanced JavaScript for Web Developers"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e)
                                    handleInputChange("title", e.target.value)
                                  }}
                                />
                              </FormControl>
                              <FormDescription>A clear and concise title for your course.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel htmlFor="course-description">Course Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  id="course-description"
                                  placeholder="Describe what students will learn in this course..."
                                  className="min-h-[120px]"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e)
                                    handleInputChange("description", e.target.value)
                                  }}
                                />
                              </FormControl>
                              <FormDescription>
                                Provide a detailed description of your course content and learning outcomes.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel htmlFor="course-category">Category</FormLabel>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value)
                                    handleInputChange("category", value)
                                  }}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger id="course-category">
                                      <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="programming">Programming</SelectItem>
                                    <SelectItem value="design">Design</SelectItem>
                                    <SelectItem value="business">Business</SelectItem>
                                    <SelectItem value="marketing">Marketing</SelectItem>
                                    <SelectItem value="music">Music</SelectItem>
                                    <SelectItem value="language">Language</SelectItem>
                                    <SelectItem value="science">Science</SelectItem>
                                    <SelectItem value="math">Mathematics</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>Select the category that best fits your course.</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="level"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel htmlFor="course-level">Difficulty Level</FormLabel>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value)
                                    handleInputChange("level", value)
                                  }}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger id="course-level">
                                      <SelectValue placeholder="Select a level" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="beginner">Beginner</SelectItem>
                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                    <SelectItem value="advanced">Advanced</SelectItem>
                                    <SelectItem value="all">All Levels</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>Indicate the difficulty level of your course.</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="deadline"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel htmlFor="course-deadline">Completion Deadline</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        id="course-deadline"
                                        variant={"outline"}
                                        className={cn(
                                          "w-full pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground",
                                        )}
                                      >
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={(date) => {
                                        field.onChange(date)
                                        if (date) handleInputChange("deadline", date)
                                      }}
                                      disabled={(date) => date < new Date()}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormDescription>
                                  The date by which students should complete the course.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" type="button">
                          Save as Draft
                        </Button>
                        <Button type="button" onClick={() => setActiveTab("sessions")}>
                          Next: Session Types
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  <TabsContent value="sessions" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Session Types</CardTitle>
                        <CardDescription>
                          Select the types of sessions you want to offer for this course
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="sessionTypes"
                          render={() => (
                            <FormItem>
                              <div className="mb-4">
                                <FormLabel>Available Session Types</FormLabel>
                                <FormDescription>Select at least one session type for your course.</FormDescription>
                              </div>
                              <div className="space-y-4">
                                {sessionTypes.map((item) => (
                                  <FormField
                                    key={item.id}
                                    control={form.control}
                                    name="sessionTypes"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={item.id}
                                          className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              id={`session-type-${item.id}`}
                                              checked={field.value?.includes(item.id)}
                                              onCheckedChange={(checked) => {
                                                const current = field.value || []
                                                const newValue = checked
                                                  ? [...current, item.id]
                                                  : current.filter((value) => value !== item.id)
                                                field.onChange(newValue)
                                                handleInputChange("sessionTypes", newValue)
                                              }}
                                            />
                                          </FormControl>
                                          <div className="space-y-1 leading-none">
                                            <FormLabel htmlFor={`session-type-${item.id}`} className="text-base">
                                              {item.label}
                                            </FormLabel>
                                            {item.id === "online" && (
                                              <FormDescription>
                                                Pre-recorded videos and materials that students can access anytime.
                                              </FormDescription>
                                            )}
                                            {item.id === "group" && (
                                              <FormDescription>
                                                Live sessions with multiple students at scheduled times.
                                              </FormDescription>
                                            )}
                                            {item.id === "oneOnOne" && (
                                              <FormDescription>
                                                Private one-on-one sessions with individual students.
                                              </FormDescription>
                                            )}
                                          </div>
                                        </FormItem>
                                      )
                                    }}
                                  />
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" type="button" onClick={() => setActiveTab("basic")}>
                          Previous: Basic Information
                        </Button>
                        <Button type="button" onClick={() => setActiveTab("pricing")}>
                          Next: Pricing & Schedule
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  <TabsContent value="pricing" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Pricing & Schedule</CardTitle>
                        <CardDescription>Set the pricing and schedule for each session type</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-8">
                        {watchSessionTypes.includes("online") && (
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Online Course</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="pricing.online.price"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Price ($)</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                          type="number"
                                          min={0}
                                          step={0.01}
                                          className="pl-9"
                                          {...field}
                                          onChange={(e) => {
                                            field.onChange(e)
                                            handleInputChange("pricing.online.price", e.target.value)
                                          }}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="pricing.online.maxStudents"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Max Students</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min={1}
                                        {...field}
                                        onChange={(e) => {
                                          field.onChange(e)
                                          handleInputChange("pricing.online.maxStudents", e.target.value)
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div>
                              <FormLabel>Schedule</FormLabel>
                              {renderScheduleFields("online")}
                            </div>
                          </div>
                        )}

                        {watchSessionTypes.includes("group") && (
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Group Sessions</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="pricing.group.price"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Price ($)</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                          type="number"
                                          min={0}
                                          step={0.01}
                                          className="pl-9"
                                          {...field}
                                          onChange={(e) => {
                                            field.onChange(e)
                                            handleInputChange("pricing.group.price", e.target.value)
                                          }}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="pricing.group.maxStudents"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Max Students</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min={1}
                                        {...field}
                                        onChange={(e) => {
                                          field.onChange(e)
                                          handleInputChange("pricing.group.maxStudents", e.target.value)
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div>
                              <FormLabel>Schedule</FormLabel>
                              {renderScheduleFields("group")}
                            </div>
                          </div>
                        )}

                        {watchSessionTypes.includes("oneOnOne") && (
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">One-on-One Sessions</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="pricing.oneOnOne.price"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Price ($)</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                          type="number"
                                          min={0}
                                          step={0.01}
                                          className="pl-9"
                                          {...field}
                                          onChange={(e) => {
                                            field.onChange(e)
                                            handleInputChange("pricing.oneOnOne.price", e.target.value)
                                          }}
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="pricing.oneOnOne.maxStudents"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Max Students</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min={1}
                                        {...field}
                                        onChange={(e) => {
                                          field.onChange(e)
                                          handleInputChange("pricing.oneOnOne.maxStudents", e.target.value)
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div>
                              <FormLabel>Schedule</FormLabel>
                              {renderScheduleFields("oneOnOne")}
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" type="button" onClick={() => setActiveTab("sessions")}>
                          Previous: Session Types
                        </Button>
                        <Button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => onSubmit(form.getValues())}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating Course...
                            </>
                          ) : "Create Course"}
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                </Tabs>
              </form>
            </Form>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}