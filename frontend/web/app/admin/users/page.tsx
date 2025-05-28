"use client";

import { useState, useEffect } from "react";
import {
  Ban,
  Check,
  Eye,
  Filter,
  MoreHorizontal,
  Search,
  Shield,
  User,
  X,
  FileText,
  Lock,
  Calendar,
  RefreshCw,
  ChevronDown,
  Download,
  ExternalLink,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
const PasswordInput = (props: React.ComponentProps<typeof Input>) => (
  <Input type="password" {...props} />
);

interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  emailVerified: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  // phoneNumber?: string;
  profile?: string;
  otp?: string;
  otpExpiresAt?: Date;
}

const createUserSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    role: z.string(),
    phoneNumber: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

interface CreateUserFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  // phoneNumber?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string[]>([
    "admin",
    "tutor",
    "student",
  ]);
  const [statusFilter, setStatusFilter] = useState<string[]>([
    "active",
    "inactive",
    "suspended",
  ]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  // const API_BASE = process.env.NEXT_PUBLIC_API_URL || "${baseUrl}";

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "admin",
      // phoneNumber: "",
    },
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${baseUrl}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format: Expected array of users");
      }

      const formattedUsers = data.map((user: any) => ({
        _id: user._id,
        id: user._id,
        name: user.name || "Unknown User",
        email: user.email || "no-email@example.com",
        role: user.role?.toLowerCase() || "student",
        status: user.status?.toLowerCase() || "active",
        emailVerified: user.emailVerified || false,
        avatar: user.profile || `/placeholder.svg?height=40&width=40`,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString(),
        // phoneNumber: user.phoneNumber || "",
        profile: user.profile || "",
      }));

      setUsers(formattedUsers);
    } catch (err: any) {
      console.error("Fetch Error:", err);
      const errorMessage = err.message || "Failed to load users";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    // Safe checks for undefined/null values
    const userName = user.name || "";
    const userEmail = user.email || "";
    const userId = user.id || "";
    const userRole = user.role || "";
    const userStatus = user.status || "";

    const matchesSearch =
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter.includes(userRole.toLowerCase());
    const matchesStatus = statusFilter.includes(userStatus.toLowerCase());

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${baseUrl}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "suspended",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedUser = await response.json();

      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, status: "suspended" } : user
        )
      );

      toast.success("The user has been successfully suspended");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to suspend user";
      toast.error("Failed to suspend user");
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${baseUrl}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "active",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedUser = await response.json();

      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, status: "active" } : user
        )
      );

      toast.success("The user has been successfully activated");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to activate user";
      toast.error("Failed to activate user");
    }
  };

  const handleCreateUser = async (values: CreateUserFormValues) => {
    try {
      setIsCreatingUser(true);

      // Remove the Authorization header since your Postman example works without it
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Remove Authorization header if your register endpoint doesn't require it
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role,
          // Remove phoneNumber if not required by your backend
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // More detailed error message handling
        throw new Error(
          errorData.message ||
            errorData.error ||
            `Server responded with ${response.status}`
        );
      }

      const newUser = await response.json();

      // Update state with the new user
      setUsers([
        {
          _id: newUser.userId, // Match the field name from your response
          id: newUser.userId,
          name: values.name,
          email: values.email,
          role: values.role,
          status: "active", // Default status
          emailVerified: false, // Assuming email needs verification
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...users,
      ]);

      toast.success(newUser.message || "User created successfully");

      setIsCreateUserDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Creation error:", error);
      toast.error("Unknown error occurred");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleRefresh = () => {
    setSearchQuery("");
    setRoleFilter(["admin", "tutor", "student"]);
    setStatusFilter(["active", "inactive", "suspended"]);
    setError(null);
    fetchUsers();
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr]">
          <AdminSidebar />
          <main className="flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h1 className="text-lg font-semibold">User Management</h1>
                <p className="text-sm text-muted-foreground">
                  Manage users, tutors, and administrators
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
                <p>Loading users...</p>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (error && users.length === 0) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr]">
          <AdminSidebar />
          <main className="flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h1 className="text-lg font-semibold">User Management</h1>
                <p className="text-sm text-muted-foreground">
                  Manage users, tutors, and administrators
                </p>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
              <div className="text-center max-w-md">
                <div className="text-destructive mb-2">
                  <Ban className="h-8 w-8 mx-auto" />
                  <p className="font-medium mt-2">Error loading users</p>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <div className="bg-gray-100 p-3 rounded-md text-left mb-4 text-xs">
                  <p className="font-mono break-all">
                    Endpoint: ${baseUrl}/api/users
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={handleRefresh}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                  {process.env.NODE_ENV === "development" && (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setUsers([
                          {
                            _id: "dev-1",
                            id: "dev-1",
                            name: "Demo Admin",
                            email: "admin@example.com",
                            role: "admin",
                            status: "active",
                            emailVerified: true,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            // phoneNumber: "+1234567890",
                          },
                          {
                            _id: "dev-2",
                            id: "dev-2",
                            name: "Demo Tutor",
                            email: "tutor@example.com",
                            role: "tutor",
                            status: "active",
                            emailVerified: true,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            // phoneNumber: "+1234567891",
                          },
                          {
                            _id: "dev-3",
                            id: "dev-3",
                            name: "Demo Student",
                            email: "student@example.com",
                            role: "student",
                            status: "suspended",
                            emailVerified: true,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            // phoneNumber: "+1234567892",
                          },
                        ]);
                        setError(null);
                      }}
                    >
                      Use Demo Data
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr]">
        <AdminSidebar />
        <main className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">User Management</h1>
              <p className="text-sm text-muted-foreground">
                Manage users, tutors, and administrators
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button size="sm" onClick={() => setIsCreateUserDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create User
              </Button>
            </div>
          </div>
          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Roles <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuCheckboxItem
                      checked={roleFilter.includes("admin")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setRoleFilter([...roleFilter, "admin"]);
                        } else {
                          setRoleFilter(
                            roleFilter.filter((r) => r !== "admin")
                          );
                        }
                      }}
                    >
                      Admin
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={roleFilter.includes("tutor")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setRoleFilter([...roleFilter, "tutor"]);
                        } else {
                          setRoleFilter(
                            roleFilter.filter((r) => r !== "tutor")
                          );
                        }
                      }}
                    >
                      Tutor
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={roleFilter.includes("student")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setRoleFilter([...roleFilter, "student"]);
                        } else {
                          setRoleFilter(
                            roleFilter.filter((r) => r !== "student")
                          );
                        }
                      }}
                    >
                      Student
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Status <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuCheckboxItem
                      checked={statusFilter.includes("active")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStatusFilter([...statusFilter, "active"]);
                        } else {
                          setStatusFilter(
                            statusFilter.filter((s) => s !== "active")
                          );
                        }
                      }}
                    >
                      Active
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter.includes("inactive")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStatusFilter([...statusFilter, "inactive"]);
                        } else {
                          setStatusFilter(
                            statusFilter.filter((s) => s !== "inactive")
                          );
                        }
                      }}
                    >
                      Inactive
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter.includes("suspended")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStatusFilter([...statusFilter, "suspended"]);
                        } else {
                          setStatusFilter(
                            statusFilter.filter((s) => s !== "suspended")
                          );
                        }
                      }}
                    >
                      Suspended
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Card>
              <CardHeader className="py-4">
                <div className="flex justify-between items-center">
                  <CardTitle>Users ({filteredUsers.length})</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredUsers.length} of {users.length} total users
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No users found matching your criteria
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={user.avatar}
                                    alt={user.name}
                                  />
                                  <AvatarFallback>
                                    {user.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  user.role === "admin"
                                    ? "default"
                                    : user.role === "tutor"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {user.role === "admin" && (
                                  <Shield className="mr-1 h-3 w-3" />
                                )}
                                {user.role.charAt(0).toUpperCase() +
                                  user.role.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  user.status === "active"
                                    ? "default"
                                    : user.status === "inactive"
                                    ? "outline"
                                    : "destructive"
                                }
                              >
                                {user.status.charAt(0).toUpperCase() +
                                  user.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleViewDetails(user)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {user.status === "suspended" ? (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleActivateUser(user._id)
                                      }
                                    >
                                      <Check className="mr-2 h-4 w-4" />
                                      Activate User
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleSuspendUser(user._id)
                                      }
                                    >
                                      <Ban className="mr-2 h-4 w-4" />
                                      Suspend User
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* User Details Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>User Details</DialogTitle>
                </DialogHeader>
                {selectedUser && (
                  <div className="grid gap-4 py-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={selectedUser.avatar}
                          alt={selectedUser.name}
                        />
                        <AvatarFallback>
                          {selectedUser.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h3 className="text-xl font-semibold">
                          {selectedUser.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{selectedUser.email}</span>
                          <span>•</span>
                          {/* <span>
                            {selectedUser.phoneNumber || "No phone provided"}
                          </span> */}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="text-sm">
                            {selectedUser.role}
                          </Badge>
                          <Badge
                            variant={
                              selectedUser.status === "active"
                                ? "default"
                                : selectedUser.status === "inactive"
                                ? "outline"
                                : "destructive"
                            }
                            className="text-sm"
                          >
                            {selectedUser.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-base flex items-center gap-2">
                            <User className="h-4 w-4" /> Basic Information
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                User ID:
                              </span>
                              <span className="font-mono">
                                {selectedUser.id}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Email Verified:
                              </span>
                              <span>
                                {selectedUser.emailVerified ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <X className="h-4 w-4 text-red-500" />
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-base flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Account Dates
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Created:
                              </span>
                              <span>
                                {new Date(
                                  selectedUser.createdAt
                                ).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Last Updated:
                              </span>
                              <span>
                                {new Date(
                                  selectedUser.updatedAt
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-base flex items-center gap-2">
                            <Lock className="h-4 w-4" /> Account Status
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Current Status:
                              </span>
                              <Badge
                                variant={
                                  selectedUser.status === "active"
                                    ? "default"
                                    : selectedUser.status === "inactive"
                                    ? "outline"
                                    : "destructive"
                                }
                              >
                                {selectedUser.status}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              {/* <span className="text-muted-foreground">
                                Phone Number:
                              </span> */}
                              {/* <span>
                                {selectedUser.phoneNumber || "Not provided"}
                              </span> */}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-6">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Close
                      </Button>
                      {selectedUser.status !== "suspended" ? (
                        <Button
                          variant="destructive"
                          onClick={() => handleSuspendUser(selectedUser._id)}
                        >
                          Suspend User
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleActivateUser(selectedUser._id)}
                        >
                          Activate User
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Create User Dialog */}
            <Dialog
              open={isCreateUserDialogOpen}
              onOpenChange={setIsCreateUserDialogOpen}
            >
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Add a new user to the system. All fields are required unless
                    marked optional.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleCreateUser)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
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
                            <Input placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="admin">Admin</option>
                              <option value="tutor">Tutor</option>
                              <option value="student">Student</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <PasswordInput placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <PasswordInput placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsCreateUserDialogOpen(false);
                          form.reset();
                        }}
                        disabled={isCreatingUser}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isCreatingUser}>
                        {isCreatingUser ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create User"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
