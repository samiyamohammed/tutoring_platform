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

export default function Setting() {
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false); // ✅ single edit toggle

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      profile: "",
    },
  });

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
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, router, profileForm]);

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

      setIsEditing(false); // ✅ turn off editing after update
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  });

  if (loading && !profile) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <StudentSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h1 className="text-lg font-semibold">Settings</h1>
          </div>
          <div className="p-4 space-y-6">
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
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
