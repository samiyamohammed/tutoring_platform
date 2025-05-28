"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Clock, Users, BookOpen } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { TutorSidebar } from "@/components/tutor-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

// import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

interface SessionSchedule {
  day: string;
  startTime: string;
  endTime: string;
}

interface SessionPricing {
  price: number;
  maxStudents: number;
  schedule: SessionSchedule[];
}

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  sessionTypes: ("online" | "group" | "oneOnOne")[];
  pricing: {
    online?: SessionPricing;
    group?: SessionPricing;
    oneOnOne?: SessionPricing;
  };
  status: "pending" | "approved" | "rejected";
}

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "beginner",
    sessionTypes: [] as ("online" | "group" | "oneOnOne")[],
    pricing: {
      online: { price: 0, maxStudents: 1, schedule: [] as SessionSchedule[] },
      group: { price: 0, maxStudents: 10, schedule: [] as SessionSchedule[] },
      oneOnOne: { price: 0, maxStudents: 1, schedule: [] as SessionSchedule[] },
    },
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${baseUrl}/api/course/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch course");

        const data = await response.json();
        setCourse(data);
        setFormData({
          title: data.title,
          description: data.description,
          category: data.category,
          level: data.level,
          sessionTypes: data.sessionTypes || [],
          pricing: {
            online: data.pricing?.online || {
              price: 0,
              maxStudents: 0,
              schedule: [],
            },
            group: data.pricing?.group || {
              price: 0,
              maxStudents: 0,
              schedule: [],
            },
            oneOnOne: data.pricing?.oneOnOne || {
              price: 0,
              maxStudents: 0,
              schedule: [],
            },
          },
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to load course",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSessionTypeToggle = (type: "online" | "group" | "oneOnOne") => {
    setFormData((prev) => {
      const newSessionTypes = prev.sessionTypes.includes(type)
        ? prev.sessionTypes.filter((t) => t !== type)
        : [...prev.sessionTypes, type];

      return {
        ...prev,
        sessionTypes: newSessionTypes,
      };
    });
  };

  const handlePricingChange = (
    type: "online" | "group" | "oneOnOne",
    field: "price" | "maxStudents",
    value: string
  ) => {
    const numValue = field === "price" ? parseFloat(value) : parseInt(value);
    setFormData((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [type]: {
          ...prev.pricing[type],
          [field]: isNaN(numValue) ? 0 : numValue,
        },
      },
    }));
  };

  const addScheduleSlot = (type: "online" | "group" | "oneOnOne") => {
    setFormData((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [type]: {
          ...prev.pricing[type],
          schedule: [
            ...prev.pricing[type].schedule,
            { day: "Monday", startTime: "09:00", endTime: "10:00" },
          ],
        },
      },
    }));
  };

  const updateScheduleSlot = <K extends keyof SessionSchedule>(
    type: "online" | "group" | "oneOnOne",
    index: number,
    field: K,
    value: SessionSchedule[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [type]: {
          ...prev.pricing[type],
          schedule: prev.pricing[type].schedule.map((slot, i) =>
            i === index
              ? { ...(slot as SessionSchedule), [field]: value }
              : slot
          ),
        },
      },
    }));
  };

  const removeScheduleSlot = (
    type: "online" | "group" | "oneOnOne",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [type]: {
          ...prev.pricing[type],
          schedule: prev.pricing[type].schedule.filter((_, i) => i !== index),
        },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/api/course/${courseId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            pricing: {
              ...(formData.sessionTypes.includes("online")
                ? { online: formData.pricing.online }
                : {}),
              ...(formData.sessionTypes.includes("group")
                ? { group: formData.pricing.group }
                : {}),
              ...(formData.sessionTypes.includes("oneOnOne")
                ? { oneOnOne: formData.pricing.oneOnOne }
                : {}),
            },
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update course");

      toast({
        title: "Success",
        description: "Course updated successfully",
      });
      router.push("/tutor/courses");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update course",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <TutorSidebar />
          <main className="flex flex-col p-8">
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (!course) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <TutorSidebar />
          <main className="flex flex-col p-8">
            <div className="text-center">
              <p className="mb-4">Course not found</p>
              <Button asChild>
                <Link href="/tutor/courses">Back to Courses</Link>
              </Button>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <TutorSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/tutor/courses">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-lg font-semibold">
                Edit Course: {course.title}
              </h1>
              <Badge variant="secondary">
                {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
              </Badge>
            </div>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>

          <div className="p-8">
            <Tabs defaultValue="basic">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label>Course Title*</Label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description*</Label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category*</Label>
                    <Input
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Level*</Label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, level: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sessions" className="pt-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={
                        formData.sessionTypes.includes("online")
                          ? "default"
                          : "outline"
                      }
                      onClick={() => handleSessionTypeToggle("online")}
                    >
                      Online
                    </Button>
                    <Button
                      type="button"
                      variant={
                        formData.sessionTypes.includes("group")
                          ? "default"
                          : "outline"
                      }
                      onClick={() => handleSessionTypeToggle("group")}
                    >
                      Group
                    </Button>
                    <Button
                      type="button"
                      variant={
                        formData.sessionTypes.includes("oneOnOne")
                          ? "default"
                          : "outline"
                      }
                      onClick={() => handleSessionTypeToggle("oneOnOne")}
                    >
                      1-on-1
                    </Button>
                  </div>

                  {formData.sessionTypes.map((type) => (
                    <div key={type} className="border rounded-lg p-4 space-y-4">
                      <h3 className="font-medium">
                        {type === "online"
                          ? "Online"
                          : type === "group"
                          ? "Group"
                          : "1-on-1"}{" "}
                        Schedule
                      </h3>

                      <div className="space-y-2">
                        <Label>Time Slots</Label>
                        {formData.pricing[type].schedule.map((slot, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end"
                          >
                            <div>
                              <Label>Day</Label>
                              <Select
                                value={slot.day}
                                onValueChange={(value) =>
                                  updateScheduleSlot(type, index, "day", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    "Monday",
                                    "Tuesday",
                                    "Wednesday",
                                    "Thursday",
                                    "Friday",
                                    "Saturday",
                                    "Sunday",
                                  ].map((day) => (
                                    <SelectItem key={day} value={day}>
                                      {day}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Start Time</Label>
                              <Input
                                type="time"
                                value={slot.startTime || "09:00"}
                                onChange={(e) =>
                                  updateScheduleSlot(
                                    type,
                                    index,
                                    "startTime",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label>End Time</Label>
                              <Input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) =>
                                  updateScheduleSlot(
                                    type,
                                    index,
                                    "endTime",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeScheduleSlot(type, index)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addScheduleSlot(type)}
                        >
                          Add Time Slot
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="pt-6">
                <div className="space-y-4">
                  {formData.sessionTypes.map((type) => (
                    <div key={type} className="border rounded-lg p-4 space-y-4">
                      <h3 className="font-medium">
                        {type === "online"
                          ? "Online"
                          : type === "group"
                          ? "Group"
                          : "1-on-1"}{" "}
                        Pricing
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Price (ETB)*</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.pricing[type].price.toString()}
                            onChange={(e) =>
                              handlePricingChange(type, "price", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Students*</Label>
                          <Input
                            type="number"
                            min="1"
                            value={formData.pricing[type].maxStudents}
                            onChange={(e) =>
                              handlePricingChange(
                                type,
                                "maxStudents",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
