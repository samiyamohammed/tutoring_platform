"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StudentSidebar } from "@/components/student-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, Loader2, Pencil } from "lucide-react";
import { Sun, Moon, ChevronDown, ChevronUp } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  profile?: string;
  role: string;
}

const helpSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  message: z.string().min(10, "Message should be at least 10 characters long"),
});

const helpFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters" }),
});
type HelpFormValues = z.infer<typeof helpFormSchema>;

const passwordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function Setting() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [activeTermIndex, setActiveTermIndex] = useState<number | null>(null);
  const [activeFAQIndex, setActiveFAQIndex] = useState<number | null>(null);

  const toggleTerm = (index: number) => {
    setActiveTermIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const toggleFAQ = (index: number) => {
    setActiveFAQIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const form = useForm<HelpFormValues>({
    resolver: zodResolver(helpFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const handleSubmit = async (values: HelpFormValues) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      toast.error("Please login to contact support");
      return;
    }

    try {
      // Validate message length client-side first
      if (values.message.trim().length < 10) {
        toast.error("Message must be at least 10 characters");
        return;
      }

      const response = await fetch("http://localhost:5000/api/help", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to submit request");
      }

      toast.success("Message sent successfully!", {
        description: "Thank you for contacting us! We'll respond shortly.",
        duration: 5000,
      });

      form.reset();
    } catch (error) {
      toast.error("Failed to send message", {
        description: "Please try again later.",
      });
    }
  };

  const helpForm = useForm<z.infer<typeof helpSchema>>({
    resolver: zodResolver(helpSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate current theme after all hooks
  const currentTheme = mounted
    ? theme === "system"
      ? systemTheme
      : theme
    : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5000/api/users/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data: UserProfile = await res.json();
        setProfile(data);
        helpForm.setValue("name", data.name);
        helpForm.setValue("email", data.email);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, router, helpForm]);

  if (!mounted || (loading && !profile))
    return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!currentTheme) return <p className="p-4">Loading theme...</p>;

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <StudentSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h1 className="text-lg font-semibold">Settings</h1>
            </div>
            <div className="px-4 py-2">
              <Button
                variant="outline"
                onClick={() =>
                  setTheme(currentTheme === "dark" ? "light" : "dark")
                }
                className="flex items-center"
              >
                {currentTheme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                <span className="ml-2">
                  {currentTheme === "dark" ? "Light" : "Dark"}
                </span>
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Terms and Conditions</CardTitle>
                <CardDescription>
                  Read our key policies below or view the{" "}
                  <Link
                    href="/terms-and-conditions"
                    className="text-primary hover:underline"
                  >
                    full terms and conditions
                  </Link>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    {
                      title: "User Responsibilities",
                      content:
                        "You agree to use the platform ethically and responsibly.",
                    },
                    {
                      title: "Privacy Policy",
                      content:
                        "Your data is protected and will not be shared without consent.",
                    },
                    {
                      title: "Content Ownership",
                      content:
                        "Content remains the property of its respective owners.",
                    },
                  ].map((term, index) => {
                    const isOpen = activeTermIndex === index;
                    return (
                      <div key={index} className="border rounded p-3">
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleTerm(index)}
                        >
                          <span className="font-medium">{term.title}</span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                        {isOpen && (
                          <p className="text-sm mt-2 text-muted-foreground transition-all duration-300">
                            {term.content}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            {/* FAQs Card */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Click on a question to view the answer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    {
                      question: "How do I enroll in a course?",
                      answer:
                        "Navigate to the Courses page and click 'Enroll' next to the course.",
                    },
                    {
                      question: "Can I reset my password?",
                      answer:
                        "Yes, go to Settings > Change Password to update your credentials.",
                    },
                    {
                      question: "How do I contact support?",
                      answer:
                        "Use the Help & Support form below to reach out to our team.",
                    },
                  ].map((faq, index) => {
                    const isOpen = activeFAQIndex === index;
                    return (
                      <div key={index} className="border rounded p-3">
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleFAQ(index)}
                        >
                          <span className="font-medium">{faq.question}</span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                        {isOpen && (
                          <p className="text-sm mt-2 text-muted-foreground transition-all duration-300">
                            {faq.answer}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            {/* Help and Support Card */}
            <Card>
              <CardHeader>
                <CardTitle>Help & Support</CardTitle>
                <CardDescription>
                  Need assistance? Send us a message and we'll get back to you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your name"
                              {...field}
                              disabled={form.formState.isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              {...field}
                              disabled={form.formState.isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <textarea
                              {...field}
                              className="w-full p-2 border rounded resize-none min-h-[120px]"
                              placeholder="Write your message here..."
                              disabled={form.formState.isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
