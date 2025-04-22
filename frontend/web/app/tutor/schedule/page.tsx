"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { TutorSidebar } from "@/components/tutor-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const sessionFormSchema = z.object({
  title: z.string().min(1, { message: "Session title is required" }),
  description: z.string().optional(),
  courseId: z.string().min(1, { message: "Please select a course" }),
  sessionType: z.string(),
  date: z.date({ required_error: "Session date is required" }),
  startTime: z.string().min(1, { message: "Start time is required" }),
  duration: z.coerce.number().min(15, { message: "Duration must be at least 15 minutes" }),
  maxParticipants: z.coerce.number().min(1).optional(),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.enum(["daily", "weekly", "biweekly", "monthly"]).default("daily"),
  recurringEndDate: z.date().nullable().optional(),
  isRecordingEnabled: z.boolean().default(false),
  allowScreenSharing: z.boolean().default(true),
  allowChat: z.boolean().default(true),
  requireRegistration: z.boolean().default(false),
  selectedStudents: z.array(z.string()).optional(),
})

type SessionFormValues = z.infer<typeof sessionFormSchema>

// Mock data for courses
const mockCourses = [
  { id: "1", title: "Advanced JavaScript Programming" },
  { id: "2", title: "Machine Learning Fundamentals" },
  { id: "3", title: "UI/UX Design Principles" },
]

// Mock data for students
const mockStudents = [
  { id: "1", name: "Jane Doe", email: "jane.doe@example.com" },
  { id: "2", name: "John Smith", email: "john.smith@example.com" },
  { id: "3", name: "Sarah Johnson", email: "sarah.j@example.com" },
  { id: "4", name: "Michael Brown", email: "michael.b@example.com" },
  { id: "5", name: "Emily Wilson", email: "emily.w@example.com" },
]

export default function SessionSchedulerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<SessionFormValues>({
      resolver: zodResolver(sessionFormSchema) as any,
      defaultValues: {
        title: "",
        description: "",
        courseId: "",
        sessionType: "group",
        date: new Date(), // Add default value for date
        startTime: "09:00",
        duration: 60,
        maxParticipants: 10,
        isRecurring: false,
        isRecordingEnabled: false,
        allowScreenSharing: true,
        allowChat: true,
        requireRegistration: false,
        selectedStudents: [],
        recurringPattern: "daily",
      },
    })

  const watchSessionType = form.watch("sessionType")
  const watchIsRecurring = form.watch("isRecurring")
  const watchRequireRegistration = form.watch("requireRegistration")

  async function onSubmit(values: Omit<SessionFormValues, "recurringPattern"> & { recurringPattern: "daily" | "weekly" | "biweekly" | "monthly" }) {
    setIsSubmitting(true)

    try {
      // This would be replaced with actual API call
      console.log(values)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Session scheduled",
        description: "Your video session has been scheduled successfully.",
      })

      // Redirect to sessions page
      router.push("/tutor/video-session")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to schedule session. Please try again.",
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
              <h1 className="text-lg font-semibold">Schedule Video Session</h1>
              <p className="text-sm text-muted-foreground">Create and schedule a new video session</p>
            </div>
          </div>
          <div className="flex-1 space-y-4 p-8 pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Session Details</CardTitle>
                    <CardDescription>Set up the basic details for your video session</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Session Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. JavaScript Promises Workshop" {...field} />
                          </FormControl>
                          <FormDescription>A clear title for your session</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe what will be covered in this session..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Provide details about what students can expect</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="courseId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Related Course</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value as string | undefined}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a course" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockCourses.map((course) => (
                                <SelectItem key={course.id} value={course.id}>
                                  {course.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>The course this session is related to</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sessionType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Session Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="group" />
                                </FormControl>
                                <FormLabel className="font-normal">Group Session</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="oneOnOne" />
                                </FormControl>
                                <FormLabel className="font-normal">One-on-One Session</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="webinar" />
                                </FormControl>
                                <FormLabel className="font-normal">Webinar (One-way presentation)</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormDescription>The type of session you want to host</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Scheduling</CardTitle>
                    <CardDescription>Set when your session will take place</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Session Date</FormLabel>
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
                                  selected={field.value instanceof Date ? field.value : undefined}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>The date when the session will take place</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormDescription>The time when the session will start</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input type="number" min={15} step={15} {...field} />
                          </FormControl>
                          <FormDescription>How long the session will last (in minutes)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {watchSessionType !== "oneOnOne" && (
                      <FormField
                        control={form.control}
                        name="maxParticipants"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Participants</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} {...field} />
                            </FormControl>
                            <FormDescription>The maximum number of students who can join the session</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name="isRecurring"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Recurring Session</FormLabel>
                            <FormDescription>Set up a recurring schedule for this session</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    {watchIsRecurring && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="recurringPattern"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Recurring Pattern</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value as string | undefined}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a pattern" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="daily">Daily</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>How often the session will repeat</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="recurringEndDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>End Date</FormLabel>
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
                                      {field.value instanceof Date ? format(field.value, "PPP") : <span>Pick an end date</span>}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value instanceof Date ? field.value : undefined}
                                    onSelect={field.onChange}
                                    disabled={(date) => date <= (form.getValues("date") || new Date())}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormDescription>When the recurring sessions will end</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Session Settings</CardTitle>
                    <CardDescription>Configure additional settings for your session</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="isRecordingEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Enable Recording</FormLabel>
                            <FormDescription>Record the session for students to watch later</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="allowScreenSharing"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Allow Screen Sharing</FormLabel>
                            <FormDescription>Let participants share their screens during the session</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="allowChat"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Enable Chat</FormLabel>
                            <FormDescription>Allow participants to use the chat during the session</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="requireRegistration"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Require Registration</FormLabel>
                            <FormDescription>Require students to register before joining the session</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    {watchRequireRegistration && watchSessionType !== "oneOnOne" && (
                      <FormField
                        control={form.control}
                        name="selectedStudents"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel className="text-base">Select Students</FormLabel>
                              <FormDescription>Choose specific students who can join this session</FormDescription>
                            </div>
                            <div className="space-y-2">
                              {mockStudents.map((student) => (
                                <FormField
                                  key={student.id}
                                  control={form.control}
                                  name="selectedStudents"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={student.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(student.id)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...(field.value || []), student.id])
                                                : field.onChange(
                                                    field.value?.filter((value) => value !== student.id) || [],
                                                  )
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          {student.name} ({student.email})
                                        </FormLabel>
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
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" type="button" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Scheduling..." : "Schedule Session"}
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
