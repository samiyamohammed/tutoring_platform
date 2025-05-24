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
import { toast } from "@/hooks/use-toast";
import { Pencil } from "lucide-react";
import { Sun, Moon, ChevronDown, ChevronUp } from "lucide-react";
import { useTheme } from "next-themes";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  profile?: string;
  role: string;
}

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  profile: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || /^https?:\/\/.+\..+$/.test(val),
      "Must be a valid image URL or left empty"
    ),
});

const helpSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  message: z.string().min(10, "Message should be at least 10 characters long"),
});

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
  // All hooks called unconditionally at the top
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [activeTermIndex, setActiveTermIndex] = useState<number | null>(null);
  const [activeFAQIndex, setActiveFAQIndex] = useState<number | null>(null);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      profile: "",
    },
  });

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
  const currentTheme = mounted ? (theme === 'system' ? systemTheme : theme) : null;

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
        profileForm.setValue("name", data.name);
        profileForm.setValue("profile", data.profile || "");
        helpForm.setValue("name", data.name);
        helpForm.setValue("email", data.email);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, router, profileForm, helpForm]);

  const handleProfileUpdate = profileForm.handleSubmit(async (values) => {
    if (!token) {
      setError("You must be logged in to update profile");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to update profile");
      }

      const updated = await res.json();
      setProfile(updated);

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });

      setIsEditing(false); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  });

  const toggleTerm = (index: number) => {
    setActiveTermIndex(prev => (prev === index ? null : index));
  };

  const toggleFAQ = (index: number) => {
    setActiveFAQIndex(prev => (prev === index ? null : index));
  };

  const handleHelpSubmit = helpForm.handleSubmit(async (values) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Support message submitted:", values);

      toast({
        title: "Message Sent",
        description: "This is a simulation — no real backend involved.",
      });

      helpForm.reset({
        name: profile?.name || "",
        email: profile?.email || "",
        message: "",
      });
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: "This is a frontend-only simulation.",
        variant: "destructive",
      });
    }
  });

  const handlePasswordChange = passwordForm.handleSubmit(async (values) => {
    if (!token) {
      toast({
        title: "Not authorized",
        description: "Please log in to change your password.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newPassword: values.newPassword,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Password change failed");
      }

      toast({
        title: "Password Changed",
        description: "Your password was updated successfully.",
      });

      passwordForm.reset();
      setIsPasswordEditing(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  });

  if (!mounted || (loading && !profile)) return <p className="p-4">Loading...</p>;
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
                onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
                className="flex items-center"
              >
                {currentTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span className="ml-2">{currentTheme === 'dark' ? 'Light' : 'Dark'}</span>
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription className="flex justify-between items-center">
                  <span>Update your personal information</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(!isEditing)}
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex items-center gap-4 pb-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={
                        profileForm.watch("profile")?.trim()
                          ? profileForm.watch("profile")
                          : "/placeholder.svg"
                      }
                      alt={profile?.name || "User"}
                    />
                    <AvatarFallback>
                      {profile?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">{profile?.name}</p>
                    <p className="text-muted-foreground text-sm">{profile?.email}</p>
                  </div>
                </div>

                <Form {...profileForm}>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} disabled={!isEditing} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="profile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Picture URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/profile.jpg"
                              {...field}
                              disabled={!isEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {isEditing && (
                      <Button type="submit" disabled={loading}>
                        {loading ? "Updating..." : "Update Profile"}
                      </Button>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription className="flex justify-between items-center">
                  <span>Update your account password securely</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsPasswordEditing(!isPasswordEditing)}
                    title="Edit Password"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                              disabled={!isPasswordEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                              disabled={!isPasswordEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {isPasswordEditing && (
                      <Button type="submit" className="w-full">
                        Change Password
                      </Button>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Terms and Conditions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Terms and Conditions</CardTitle>
                <CardDescription>Read our key policies below</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { title: "User Responsibilities", content: "You agree to use the platform ethically and responsibly." },
                    { title: "Privacy Policy", content: "Your data is protected and will not be shared without consent." },
                    { title: "Content Ownership", content: "Content remains the property of its respective owners." },
                  ].map((term, index) => {
                    const isOpen = activeTermIndex === index;
                    return (
                      <div key={index} className="border rounded p-3">
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleTerm(index)}
                        >
                          <span className="font-medium">{term.title}</span>
                          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
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
                <CardDescription>Click on a question to view the answer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    {
                      question: "How do I enroll in a course?",
                      answer: "Navigate to the Courses page and click 'Enroll' next to the course.",
                    },
                    {
                      question: "Can I reset my password?",
                      answer: "Yes, go to Settings > Change Password to update your credentials.",
                    },
                    {
                      question: "How do I contact support?",
                      answer: "Use the Help & Support form below to reach out to our team.",
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
                          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
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
                <CardDescription>Need assistance? Send us a message and we'll get back to you.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...helpForm}>
                  <form onSubmit={handleHelpSubmit} className="space-y-4">
                    <FormField
                      control={helpForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={helpForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={helpForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <textarea
                              {...field}
                              className="w-full p-2 border rounded resize-none min-h-[120px]"
                              placeholder="Write your message here..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full">
                      Send Message
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