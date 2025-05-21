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
  Star,
  StarHalf,
  MoreVertical,
  Pencil,
  LogOut,
  Trash2,
  PowerOff,
  Save,
  X,
  Lock,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { TutorSidebar } from "@/components/tutor-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  bio: string;
  rating: number;
  verification_status: string;
  profile_picture?: string;
}

export default function TutorProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    _id: "",
    name: "",
    email: "",
    bio: "",
    rating: 0,
    verification_status: "pending",
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
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/auth/signin");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch profile");

        const data = await response.json();
        setProfileData(data);
        setTempData(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
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
        router.push("/auth/signin");
        return;
      }

      // Prepare update data
      const updateData: any = {
        name: tempData.name,
        email: tempData.email,
        bio: tempData.bio,
      };

      // Add password data if changing password
      if (showPasswordFields) {
        if (!passwordData.currentPassword) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Current password is required",
          });
          return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "New passwords do not match",
          });
          return;
        }

        if (passwordData.newPassword.length < 6) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Password must be at least 6 characters",
          });
          return;
        }

        updateData.currentPassword = passwordData.currentPassword;
        updateData.newPassword = passwordData.newPassword;
      }

      const response = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update profile");
      }

      // Update profile data (excluding password fields)
      setProfileData({
        ...profileData,
        name: tempData.name,
        email: tempData.email,
        bio: tempData.bio,
      });

      setIsEditing(false);
      setShowPasswordFields(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      // If password was changed, update token
      if (showPasswordFields && responseData.token) {
        localStorage.setItem("token", responseData.token);
      }
    } catch (error: any) {
      let errorMessage = error.message;

      // Handle connection errors specifically
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("Connection refused")
      ) {
        errorMessage =
          "Could not connect to the server. Please check your connection.";
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTempData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordFields = () => {
    setShowPasswordFields(!showPasswordFields);
    if (!showPasswordFields) {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <StarHalf
            key={i}
            className="w-5 h-5 fill-yellow-400 text-yellow-400"
          />
        );
      } else {
        stars.push(<Star key={i} className="w-5 h-5 text-gray-300" />);
      }
    }
    return stars;
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      router.push("/auth/signin");
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to logout",
      });
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <TutorSidebar />
          <main className="flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <p>Loading profile...</p>
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
        <main className="flex flex-col bg-gray-50">
          <div className="flex items-center justify-between border-b bg-white px-6 py-4">
            <div>
              <h1 className="text-xl font-semibold">My Profile</h1>
              <p className="text-sm text-muted-foreground">
                Manage your profile information
              </p>
            </div>
            {profileData.verification_status === "pending" && (
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                Verification Pending
              </span>
            )}
          </div>

          <div className="flex-1 p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Profile Information</h2>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleEditToggle}>
                      <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={handleEditToggle}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                  </Button>
                )}
              </div>

              <Card className="shadow-sm">
                <CardHeader className="border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle>Personal Details</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <CardContent className="p-6 space-y-6">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar
                      className={`h-32 w-32 border-4 ${
                        isEditing
                          ? "border-blue-400 cursor-pointer ring-2 ring-blue-200 hover:opacity-80 transition-opacity"
                          : "border-white"
                      }`}
                      onClick={handleAvatarClick}
                    >
                      <AvatarImage
                        src={
                          previewUrl ||
                          (profileData.profile_picture
                            ? `http://localhost:5000${profileData.profile_picture}`
                            : "/placeholder-user.jpg")
                        }
                      />
                      <AvatarFallback className="text-3xl font-medium bg-indigo-100 text-indigo-600">
                        {profileData.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      {isEditing ? (
                        <Input
                          name="name"
                          value={tempData.name}
                          onChange={handleInputChange}
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
                          value={tempData.email}
                          onChange={handleInputChange}
                          type="email"
                        />
                      ) : (
                        <p className="text-sm">{profileData.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rating</label>
                      <div className="flex items-center gap-2">
                        {renderStars(profileData.rating)}
                        <span className="text-sm text-gray-600">
                          ({profileData.rating?.toFixed?.(1) || "0.0"}/5.0)
                        </span>
                      </div>
                    </div>

                    {isEditing && (
                      <>
                        <Button
                          variant="ghost"
                          onClick={togglePasswordFields}
                          className="flex items-center gap-2 w-full justify-start"
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
                                name="currentPassword"
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                placeholder="Enter current password"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                New Password
                              </label>
                              <Input
                                name="newPassword"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                placeholder="Enter new password"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Confirm New Password
                              </label>
                              <Input
                                name="confirmPassword"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                placeholder="Confirm new password"
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bio</label>
                      {isEditing ? (
                        <Textarea
                          name="bio"
                          value={tempData.bio}
                          onChange={handleInputChange}
                          className="min-h-[120px]"
                        />
                      ) : (
                        <p className="text-sm whitespace-pre-line">
                          {profileData.bio || "No bio provided"}
                        </p>
                      )}
                    </div>
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
