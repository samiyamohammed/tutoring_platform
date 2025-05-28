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
    startTime: z
      .string()
      .min(1, { message: "Start time is required" })
      .refine((time) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
        message: "Invalid time format (HH:MM)",
      }),
    endTime: z
      .string()
      .min(1, { message: "End time is required" })
      .refine((time) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
        message: "Invalid time format (HH:MM)",
      }),
  })
  .refine(validateTimeOrder, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

// Update the conflict display in the UI
// (Removed stray JSX referencing timeConflict outside of a component)

type SessionFormValues = z.infer<typeof sessionFormSchema>;

type Course = {
  _id: string;
  title: string;
};

type Student = {
  _id: string;
  name: string;
  email: string;
};

type SessionConflict = {
  exists: boolean;
  conflictingSession?: ExistingSession;
};

type ExistingSession = {
  _id: string;
  course: {
    _id: string;
    title: string;
  };
  sessionType: string;
  sessionCategory: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: string;
};

export default function SessionSchedulerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tutorCourses, setTutorCourses] = useState<Course[]>([]);
  const [courseStudents, setCourseStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [timeConflict, setTimeConflict] = useState<SessionConflict | null>(
    null
  );
  const [existingSessions, setExistingSessions] = useState<ExistingSession[]>(
    []
  );

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

  useEffect(() => {
    const fetchTutorCourses = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user.id) {
          throw new Error("User not authenticated");
        }

        const token = localStorage.getItem("token") || "";
        const courses = await fetch(`${apiUrl}/api/course/tutor`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!courses.ok) {
          throw new Error("Failed to fetch tutor courses");
        }

        const course = await courses.json();
        setTutorCourses(course);

        const response = await fetch(`${apiUrl}/api/session/tutor`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch existing sessions");
        }

        const data = await response.json();
        setExistingSessions(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch tutor courses"
        );
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load tutor courses",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTutorCourses();
  }, [toast]);

  useEffect(() => {
    const fetchCourseStudents = async () => {
      const selectedCourseId = form.getValues("course");
      if (!selectedCourseId) {
        setCourseStudents([]);
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("token") || "";
        const response = await fetch(
          `${apiUrl}/api/enrollment/course/${selectedCourseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch course enrollments");
        }

        const enrollments = await response.json();

        const activeStudents = enrollments
          .filter((enrollment: any) =>
            ["enrolled", "in_progress"].includes(enrollment.currentStatus)
          )
          .map((enrollment: any) => ({
            _id: enrollment.student._id,
            name: enrollment.student.name,
            email: enrollment.student.email,
          }));

        setCourseStudents(activeStudents);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch course enrollments"
        );
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load course students",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseStudents();
  }, [form.watch("course"), toast]);

  useEffect(() => {
    const fetchExistingSessions = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user?.id) {
          throw new Error("User not authenticated");
        }

        const token = localStorage.getItem("token");
        const response = await fetch(`${apiUrl}/api/session/tutor`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch existing sessions");
        }

        const data = await response.json();
        setExistingSessions(data);
      } catch (err) {
        console.error("Failed to fetch existing sessions:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load existing sessions",
        });
      }
    };

    fetchExistingSessions();
  }, [toast]);

  useEffect(() => {
    form.trigger(["startTime", "endTime"]);
  }, [form.watch("startTime"), form.watch("endTime")]);

  const checkTimeConflict = (
    newSession: {
      scheduledDate: Date;
      startTime: string;
      endTime: string;
      sessionType: string;
    },
    existingSession: ExistingSession
  ): boolean => {
    // If sessions are on different days, no conflict
    const newDate = new Date(newSession.scheduledDate).toDateString();
    const existingDate = new Date(existingSession.scheduledDate).toDateString();
    if (newDate !== existingDate) return false;

    // If session types are different, no conflict
    if (newSession.sessionType !== existingSession.sessionType) return false;

    // Parse times
    const [newStartHours, newStartMins] = newSession.startTime
      .split(":")
      .map(Number);
    const [newEndHours, newEndMins] = newSession.endTime.split(":").map(Number);
    const [existingStartHours, existingStartMins] = existingSession.startTime
      .split(":")
      .map(Number);
    const [existingEndHours, existingEndMins] = existingSession.endTime
      .split(":")
      .map(Number);

    // Convert to minutes since midnight for easier comparison
    const newStart = newStartHours * 60 + newStartMins;
    const newEnd = newEndHours * 60 + newEndMins;
    const existingStart = existingStartHours * 60 + existingStartMins;
    const existingEnd = existingEndHours * 60 + existingEndMins;

    // Check for overlap
    return (
      (newStart >= existingStart && newStart < existingEnd) || // New session starts during existing
      (newEnd > existingStart && newEnd <= existingEnd) || // New session ends during existing
      (newStart <= existingStart && newEnd >= existingEnd) // New session completely overlaps existing
    );
  };

  const checkSessionConflict = (
    date: Date,
    startTime: string,
    endTime: string,
    sessionType: string
  ) => {
    setCheckingAvailability(true);
    setTimeConflict(null);

    try {
      const newSession = {
        scheduledDate: date,
        startTime,
        endTime,
        sessionType,
      };

      // Find any conflicting sessions
      const conflict = existingSessions.find(
        (session) =>
          session.status !== "declined" && // Ignore declined sessions
          checkTimeConflict(newSession, session)
      );

      if (conflict) {
        setTimeConflict({
          exists: true,
          conflictingSession: conflict,
        });
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
        description: `This time is already booked for ${timeConflict.conflictingSession?.course.title} (${timeConflict.conflictingSession?.sessionType})`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const sessionData = {
        course: values.course,
        student: values.selectedStudent,
        tutor: JSON.parse(localStorage.getItem("user") || "{}").id,
        sessionType: values.sessionType,
        sessionCategory: values.sessionCategory,
        scheduledDate: values.scheduledDate.toISOString(),
        startTime: values.startTime,
        endTime: values.endTime,
        notes: values.notes,
        status: "approved",
      };

      const response = await apiClient.post("/api/session", sessionData);

      if (response.error) {
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
      router.push("/tutor/session");
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
    const { scheduledDate, startTime, endTime, sessionType } = form.getValues();
    if (scheduledDate && startTime && endTime && sessionType) {
      checkSessionConflict(scheduledDate, startTime, endTime, sessionType);
    }
  }, [
    form.watch("scheduledDate"),
    form.watch("startTime"),
    form.watch("endTime"),
    form.watch("sessionType"),
    existingSessions, // Add this dependency
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
                              ) : tutorCourses.length > 0 ? (
                                tutorCourses.map((course) => (
                                  <SelectItem
                                    key={course._id}
                                    value={course._id}
                                  >
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
                                          : courseStudents.length === 0
                                          ? "No active students"
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
                                  ) : courseStudents.length > 0 ? (
                                    courseStudents.map((student) => (
                                      <SelectItem
                                        key={student._id}
                                        value={student._id}
                                      >
                                        {student.name} ({student.email})
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <div className="p-2 text-center text-sm">
                                      No active students found for this course
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
                                {timeConflict.conflictingSession?.course.title}{" "}
                                ({timeConflict.conflictingSession?.sessionType})
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
                    onClick={() => router.push("/tutor/session")}
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
