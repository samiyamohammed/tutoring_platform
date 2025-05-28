"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Pencil,
  LogOut,
  Save,
  X,
  Lock,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { StudentSidebar } from "@/components/student-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Link from "next/link";

interface CourseInfo {
  _id: string;
  courseId: string;
  title: string;
  thumbnail?: string;
}

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  //   bio: string;
  enrolledCourses: CourseInfo[];
  completedCourses: string[];
  certificates: string[];
  profile_picture?: string;
}

export default function StudentProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    _id: "",
    name: "",
    email: "",
    // bio: "",
    enrolledCourses: [],
    completedCourses: [],
    certificates: [],
  });
  const [tempData, setTempData] = useState<ProfileData>({ ...profileData });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/auth/signin");
          return;
        }

        const [profileRes, coursesRes] = await Promise.all([
          fetch(`${baseUrl}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${baseUrl}/api/enrollment/mycourses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!profileRes.ok || !coursesRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [profile, courses] = await Promise.all([
          profileRes.json(),
          coursesRes.json(),
        ]);

        setProfileData({ ...profile, enrolledCourses: courses });
        setTempData({ ...profile, enrolledCourses: courses });
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router, toast]);

  const handleEditToggle = () => {
    if (isEditing) {
      setTempData(profileData);
      setShowPasswordFields(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not authenticated");
        
        return;
      }

      console.log("=== SAVING PROFILE ===");
      console.log("Temp Data:", tempData);
      console.log("Password Data:", passwordData);

      // Validate password fields if shown
      if (showPasswordFields) {
        if (!passwordData.currentPassword) {
          throw new Error("Current password is required for changes");
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          throw new Error("New passwords must match");
        }
      }

      // Prepare update payload
      const payload = {
        name: tempData.name,
        email: tempData.email,
        // bio: tempData.bio,
        ...(showPasswordFields && {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      };

      console.log("Sending payload:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${baseUrl}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);

      const responseData = await response.json();
      console.log("Server response:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || "Update failed");
      }

      // Verify critical fields exist in response
      if (!responseData.name || !responseData.email) {
        console.error("Invalid server response structure:", responseData);
        throw new Error("Received invalid data from server");
      }

      // Update state with safe fields only
      setProfileData((prev) => ({
        ...prev,
        name: responseData.name,
        email: responseData.email,
        // bio: responseData.bio || "",
        // Preserve other data not modified in this update
        enrolledCourses: prev.enrolledCourses,
        completedCourses: prev.completedCourses,
        certificates: prev.certificates,
      }));

      // Reset UI states
      setIsEditing(false);
      setShowPasswordFields(false);

      // Clear password fields only if password change was attempted
      if (showPasswordFields) {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }

      // Verify update in state
      console.log("Updated profile data:", {
        name: responseData.name,
        email: responseData.email,
        // bio: responseData.bio,
      });

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Save error:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Failed to save changes";

      toast.error("Update Error: " + errorMessage);
    }
  };

  const CourseCard = ({ course }: { course: CourseInfo }) => (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border hover:shadow transition-all">
      <div className="min-w-[64px] h-16 bg-muted rounded-md overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{course.title}</h3>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/courses/${course.courseId}`)}
      >
        View <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <StudentSidebar />
          <main className="flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <StudentSidebar />
        <main className="flex flex-col bg-black">
          <div className="flex items-center justify-between border-b border-black-800 bg-gray-900 px-6 py-4">
            <div>
              <h1 className="text-xl font-semibold text-white">
                Student Profile
              </h1>
              <p className="text-sm text-gray-400">
                Manage your learning progress
              </p>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleEditToggle}>
                    <X className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" /> Save
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={handleEditToggle}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              )}
            </div>
          </div>
          <div className="flex-1 p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle>Personal Information</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => {
                            localStorage.removeItem("token");
                            router.push("/auth/signin");
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" /> Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar
                      className={`h-32 w-32 border-4 ${
                        isEditing ? "cursor-pointer ring-2 ring-blue-200" : ""
                      }`}
                      onClick={handleAvatarClick}
                    >
                      <AvatarImage
                        src={
                          previewUrl ||
                          profileData.profile_picture ||
                          "/placeholder-user.jpg"
                        }
                      />
                      <AvatarFallback className="text-3xl bg-blue-100 text-blue-600">
                        {profileData.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      {isEditing ? (
                        <Input
                          name="name"
                          value={tempData.name}
                          onChange={(e) =>
                            setTempData({ ...tempData, name: e.target.value })
                          }
                        />
                      ) : (
                        <p className="text-sm">{profileData.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      {isEditing ? (
                        <Input
                          name="email"
                          type="email"
                          value={tempData.email}
                          onChange={(e) =>
                            setTempData({ ...tempData, email: e.target.value })
                          }
                        />
                      ) : (
                        <p className="text-sm">{profileData.email}</p>
                      )}
                    </div>

                    {isEditing && (
                      <div className="space-y-4">
                        <Button
                          variant="ghost"
                          onClick={() =>
                            setShowPasswordFields(!showPasswordFields)
                          }
                          className="w-full justify-start gap-2"
                        >
                          <Lock className="h-4 w-4" />
                          {showPasswordFields
                            ? "Cancel Password Change"
                            : "Change Password"}
                        </Button>

                        {showPasswordFields && (
                          <div className="space-y-4 border-t pt-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Current Password
                              </label>
                              <Input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) =>
                                  setPasswordData({
                                    ...passwordData,
                                    currentPassword: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                New Password
                              </label>
                              <Input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) =>
                                  setPasswordData({
                                    ...passwordData,
                                    newPassword: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Confirm Password
                              </label>
                              <Input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) =>
                                  setPasswordData({
                                    ...passwordData,
                                    confirmPassword: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
