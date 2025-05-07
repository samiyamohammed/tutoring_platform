"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { enUS } from "date-fns/locale";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { TutorSidebar } from "@/components/tutor-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Custom validation function
const validateTimeOrder = (data: { startTime: string; endTime: string }) => {
  if (data.startTime && data.endTime) {
    const [startHours, startMinutes] = data.startTime.split(":").map(Number);
    const [endHours, endMinutes] = data.endTime.split(":").map(Number);

    // Convert to total minutes for comparison
    const startTotal = startHours * 60 + startMinutes;
    const endTotal = endHours * 60 + endMinutes;

    return endTotal > startTotal;
  }
  return true;
};

const sessionFormSchema = z
  .object({
    course: z.string().min(1, { message: "Please select a course" }),
    sessionCategory: z.enum(["oneToOne", "group"]),
    sessionType: z.enum(["video", "in-person"]).optional(),
    scheduledDate: z.date({ required_error: "Session date is required" }),
    notes: z.string().optional(),
    selectedStudent: z.string().optional(),
    startTime: z.string().min(1, { message: "Start time is required" }),
    endTime: z.string().min(1, { message: "End time is required" }),
  })
  .refine(validateTimeOrder, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

type SessionFormValues = z.infer<typeof sessionFormSchema>;

type Enrollment = {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  course: {
    _id: string;
    title: string;
  };
};

export default function SessionSchedulerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ; 

  const [timeConflict, setTimeConflict] = useState<{
    exists: boolean;
    courseTitle?: string;
    sessionType?: string;
  } | null>(null);

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      course: "",
      sessionCategory: "oneToOne",
      sessionType: "video",
      scheduledDate: new Date(),
      startTime: "09:00",
      endTime: "10:00",
      notes: "",
      selectedStudent: "",
    },
  });

  const watchSessionCategory = form.watch("sessionCategory");
  const watchCourse = form.watch("course");
  const [existingSessions, setExistingSessions] = useState<
    Array<{
      startTime: string;
      endTime: string;
      course: { title: string };
      sessionType: string;
    }>
  >([]);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user?._id) {
          throw new Error("User not authenticated");
        }

        const token = localStorage.getItem("token") || "";
        const response = await fetch(
          `${apiUrl}/api/enrollment/tutor`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch datas");
        }

        const data = await response.json();
        setEnrollments(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch enrollments"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  useEffect(() => {
    const fetchExistingSessions = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user?._id) {
          throw new Error("User not authenticated");
        }

        const token = localStorage.getItem("token") || "";
        const response = await fetch(
          `${apiUrl}/api/session/tutor`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch existing sessions");
        }

        const data = await response.json();
        setExistingSessions(data);
      } catch (err) {
        console.error("Failed to fetch existing sessions:", err);
      }
    };

    fetchExistingSessions();
  }, []);

  useEffect(() => {
    form.trigger(["startTime", "endTime"]); // Manually trigger validation
  }, [form.watch("startTime"), form.watch("endTime")]);

  // Group enrollments by course
  const courses = enrollments.reduce((acc, enrollment) => {
    const courseId = enrollment.course._id;
    if (!acc[courseId]) {
      acc[courseId] = {
        ...enrollment.course,
        students: [],
      };
    }
    acc[courseId].students.push(enrollment.student);
    return acc;
  }, {} as Record<string, { _id: string; title: string; students: Array<{ _id: string; name: string; email: string }> }>);

  const courseOptions = Object.values(courses).map((course) => ({
    id: course._id,
    title: course.title,
  }));

  // Get students for the currently selected course
  const currentCourseStudents = watchCourse
    ? courses[watchCourse]?.students || []
    : [];

  const checkSessionConflict = async (
    date: Date,
    startTime: string,
    endTime: string
  ) => {
    setCheckingAvailability(true);
    setTimeConflict(null);

    try {
      // Parse times (UTC)
      const startDateTime = new Date(date);
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      startDateTime.setUTCHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(date);
      const [endHours, endMinutes] = endTime.split(":").map(Number);
      endDateTime.setUTCHours(endHours, endMinutes, 0, 0);

      console.log("Checking conflicts for:", {
        startDateTime,
        endDateTime,
        existingSessions,
      });

      // Check against existing sessions
      const conflict = existingSessions.find((session) => {
        const existingStart = new Date(session.startTime);
        const existingEnd = new Date(session.endTime);

        return (
          (startDateTime >= existingStart && startDateTime < existingEnd) ||
          (endDateTime > existingStart && endDateTime <= existingEnd) ||
          (startDateTime <= existingStart && endDateTime >= existingEnd)
        );
      });

      if (conflict) {
        console.log("Conflict found:", conflict);
        setTimeConflict({
          exists: true,
          courseTitle: conflict.course.title,
          sessionType: conflict.sessionType,
        });
      } else {
        console.log("No conflicts detected.");
      }
    } catch (error) {
      console.error("Conflict check failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check availability",
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  async function onSubmit(values: SessionFormValues) {
    if (!validateTimeOrder(values)) {
      form.setError("endTime", {
        type: "manual",
        message: "End time must be after start time",
      });
      return;
    }

    if (timeConflict?.exists) {
      toast({
        variant: "destructive",
        title: "Time Conflict",
        description: `This time is already booked for ${timeConflict.courseTitle} (${timeConflict.sessionType})`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const sessionData = {
        /* ... */
      };
      const response = await apiClient.post("/session", sessionData);

      if (response.error) {
        // Handle backend-detected conflicts
        if (response.error.includes("conflict")) {
          toast({
            variant: "destructive",
            title: "Conflict Detected",
            description: response.error,
          });
          return;
        }
        throw new Error(response.error);
      }

      toast({ title: "Session scheduled!" });
      router.push("/tutor/sessions");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to schedule session",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    const { scheduledDate, startTime, endTime } = form.getValues();
    if (scheduledDate && startTime && endTime) {
      checkSessionConflict(scheduledDate, startTime, endTime);
    }
  }, [
    form.watch("scheduledDate"),
    form.watch("startTime"),
    form.watch("endTime"),
  ]);

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <TutorSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">Schedule Session</h1>
              <p className="text-sm text-muted-foreground">
                Create a new tutoring session request
              </p>
            </div>
          </div>
          <div className="flex-1 space-y-4 p-8 pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Session Details</CardTitle>
                    <CardDescription>
                      Set up the basic details for your session
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="course"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={loading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    loading
                                      ? "Loading courses..."
                                      : "Select a course"
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {loading ? (
                                <div className="p-2 text-center text-sm">
                                  Loading courses...
                                </div>
                              ) : error ? (
                                <div className="p-2 text-center text-sm text-destructive">
                                  {error}
                                </div>
                              ) : courseOptions.length > 0 ? (
                                courseOptions.map((course) => (
                                  <SelectItem key={course.id} value={course.id}>
                                    {course.title}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="p-2 text-center text-sm">
                                  No courses found
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The course this session is related to
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sessionCategory"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Session Category</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="oneToOne" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  1-on-1 Session
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="group" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Group Session
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchSessionCategory === "oneToOne" && (
                      <>
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
                                      <RadioGroupItem value="video" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      Online (Video)
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="in-person" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      In-Person
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="selectedStudent"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Select Student</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={!watchCourse || loading}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={
                                        !watchCourse
                                          ? "Select a course first"
                                          : loading
                                          ? "Loading students..."
                                          : currentCourseStudents.length === 0
                                          ? "No students enrolled"
                                          : "Select a student"
                                      }
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {loading ? (
                                    <div className="p-2 text-center text-sm">
                                      Loading students...
                                    </div>
                                  ) : error ? (
                                    <div className="p-2 text-center text-sm text-destructive">
                                      {error}
                                    </div>
                                  ) : currentCourseStudents.length > 0 ? (
                                    currentCourseStudents.map((student) => (
                                      <SelectItem
                                        key={student._id}
                                        value={student._id}
                                      >
                                        {student.name} ({student.email})
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <div className="p-2 text-center text-sm">
                                      No students found for this course
                                    </div>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Scheduling</CardTitle>
                    <CardDescription>
                      Set when your session will take place
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="scheduledDate"
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
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <DatePicker
                                  selected={field.value}
                                  onChange={(date: Date | null) => {
                                    if (date) {
                                      field.onChange(date);
                                    }
                                  }}
                                  inline
                                  minDate={new Date()}
                                  calendarClassName="bg-white"
                                  renderCustomHeader={({
                                    monthDate,
                                    decreaseMonth,
                                    increaseMonth,
                                  }) => (
                                    <div className="flex items-center justify-between px-2 py-2">
                                      <button
                                        type="button"
                                        onClick={decreaseMonth}
                                        className="rounded p-1 hover:bg-gray-100"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <polyline points="15 18 9 12 15 6"></polyline>
                                        </svg>
                                      </button>
                                      <span className="text-sm font-medium">
                                        {format(monthDate, "MMMM yyyy")}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={increaseMonth}
                                        className="rounded p-1 hover:bg-gray-100"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <polyline points="9 18 15 12 9 6"></polyline>
                                        </svg>
                                      </button>
                                    </div>
                                  )}
                                  dayClassName={(date) =>
                                    cn(
                                      "mx-0 my-0 h-8 w-8 rounded-full p-0 text-sm flex items-center justify-center",
                                      date <
                                        new Date(
                                          new Date().setHours(0, 0, 0, 0)
                                        ) && "text-gray-400",
                                      date.toDateString() ===
                                        field.value?.toDateString() &&
                                        "bg-primary text-white"
                                    )
                                  }
                                  weekDayClassName={() =>
                                    "h-8 w-8 p-0 text-sm text-gray-500 flex items-center justify-center"
                                  }
                                />
                              </PopoverContent>
                            </Popover>
                            {checkingAvailability && (
                              <FormDescription className="text-blue-500">
                                Checking availability...
                              </FormDescription>
                            )}
                            {timeConflict?.exists && (
                              <FormDescription className="text-destructive">
                                ⚠️ Conflict: Already booked for{" "}
                                {timeConflict.courseTitle} (
                                {timeConflict.sessionType})
                              </FormDescription>
                            )}
                            {!checkingAvailability &&
                              !timeConflict?.exists &&
                              form.getValues().scheduledDate && (
                                <FormDescription className="text-green-500">
                                  ✓ This time slot is available
                                </FormDescription>
                              )}
                            <FormDescription>
                              The date of the session
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                className={cn({
                                  "border-destructive":
                                    fieldState.error?.message?.includes(
                                      "before end time"
                                    ),
                                })}
                              />
                            </FormControl>
                            <FormDescription>
                              When the session will start
                              {fieldState.error?.message && (
                                <span className="text-destructive block mt-1">
                                  {fieldState.error.message}
                                </span>
                              )}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                                className={cn({
                                  "border-destructive":
                                    fieldState.error?.message?.includes(
                                      "after start time"
                                    ),
                                })}
                              />
                            </FormControl>
                            <FormDescription>
                              When the session will end
                              {fieldState.error?.message && (
                                <span className="text-destructive block mt-1">
                                  {fieldState.error.message}
                                </span>
                              )}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                    <CardDescription>
                      Provide any additional notes for the session
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any special instructions or topics to cover..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      loading ||
                      checkingAvailability ||
                      !!form.formState.errors.endTime
                    }
                  >
                    {isSubmitting ? "Submitting..." : "Schedule Session"}
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
