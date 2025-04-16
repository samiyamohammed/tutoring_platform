"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, DollarSign } from "lucide-react"

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
  maxStudents: z.coerce.number().min(1, {
    message: "At least 1 student is required.",
  }),
  sessionTypes: z.array(z.string()).min(1, {
    message: "At least one session type is required.",
  }),
  pricing: z.object({
    online: z.coerce.number().min(0, {
      message: "Price cannot be negative.",
    }),
    group: z.coerce.number().min(0, {
      message: "Price cannot be negative.",
    }),
    oneOnOne: z.coerce.number().min(0, {
      message: "Price cannot be negative.",
    }),
  }),
})

export default function CreateCoursePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("basic")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      level: "",
      maxStudents: 10,
      sessionTypes: ["online"],
      pricing: {
        online: 49.99,
        group: 99.99,
        oneOnOne: 199.99,
      },
    },
  })

  const sessionTypes = [
    { id: "online", label: "Online Course" },
    { id: "group", label: "Group Sessions" },
    { id: "oneOnOne", label: "One-on-One Sessions" },
  ]

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // This would be replaced with actual API call
      console.log(values)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Course created successfully",
        description: "Your new course has been created and is ready for content.",
      })

      // Redirect to course content page
      router.push("/tutor/courses")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create course. Please try again.",
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
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
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
                              <FormLabel>Course Title</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Advanced JavaScript for Web Developers" {...field} />
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
                              <FormLabel>Course Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe what students will learn in this course..."
                                  className="min-h-[120px]"
                                  {...field}
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
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
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
                                <FormLabel>Difficulty Level</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
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
                                <FormLabel>Completion Deadline</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
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
                                      onSelect={field.onChange}
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
                          <FormField
                            control={form.control}
                            name="maxStudents"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Maximum Students</FormLabel>
                                <FormControl>
                                  <Input type="number" min={1} {...field} />
                                </FormControl>
                                <FormDescription>
                                  The maximum number of students allowed in your course.
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
                                              checked={field.value?.includes(item.id)}
                                              onCheckedChange={(checked) => {
                                                const current = field.value || []
                                                return checked
                                                  ? field.onChange([...current, item.id])
                                                  : field.onChange(current.filter((value) => value !== item.id))
                                              }}
                                            />
                                          </FormControl>
                                          <div className="space-y-1 leading-none">
                                            <FormLabel className="text-base">{item.label}</FormLabel>
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
                          Next: Pricing
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                  <TabsContent value="pricing" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Pricing</CardTitle>
                        <CardDescription>Set the pricing for each session type</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-6">
                          {form.watch("sessionTypes")?.includes("online") && (
                            <FormField
                              control={form.control}
                              name="pricing.online"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Online Course Price ($)</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                      <Input type="number" min={0} step={0.01} className="pl-9" {...field} />
                                    </div>
                                  </FormControl>
                                  <FormDescription>
                                    Price for access to pre-recorded content and materials.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                          {form.watch("sessionTypes")?.includes("group") && (
                            <FormField
                              control={form.control}
                              name="pricing.group"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Group Session Price ($)</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                      <Input type="number" min={0} step={0.01} className="pl-9" {...field} />
                                    </div>
                                  </FormControl>
                                  <FormDescription>Price per student for group sessions.</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                          {form.watch("sessionTypes")?.includes("oneOnOne") && (
                            <FormField
                              control={form.control}
                              name="pricing.oneOnOne"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>One-on-One Session Price ($)</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                      <Input type="number" min={0} step={0.01} className="pl-9" {...field} />
                                    </div>
                                  </FormControl>
                                  <FormDescription>Price per hour for private one-on-one sessions.</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" type="button" onClick={() => setActiveTab("sessions")}>
                          Previous: Session Types
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Creating Course..." : "Create Course"}
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
