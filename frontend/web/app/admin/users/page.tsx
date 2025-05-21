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
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";

interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  verified: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  subjects?: string[];
  verification_documents?: {
    name: string;
    size: string;
    type: string;
  }[];
  permissions?: string[];
  __v?: number;
  phone?: string;
  address?: string;
  rejectionReason?: string;
  verification_status?: string;
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string[]>([
    "admin",
    "tutor",
    "student",
  ]);
  const [statusFilter, setStatusFilter] = useState<string[]>([
    "approved",
    "pending",
    "rejected",
    "initial",
  ]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingDocuments, setViewingDocuments] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{
    name: string;
    size: string;
    type: string;
  } | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE}/api/users`, {
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
        role: user.role?.toLowerCase() || "user",
        status: user.verification_status?.toLowerCase() || "initial",
        verified: user.verification_status === "approved",
        avatar: user.avatar || `/placeholder.svg?height=40&width=40`,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString(),
        subjects: user.subjects || [],
        verification_documents: user.verification_documents || [],
        permissions: user.permissions || [],
        __v: user.__v || 0,
        phone: user.phone || "",
        address: user.address || "",
        rejectionReason: user.rejectionReason || "",
        verification_status: user.verification_status || "initial",
      }));

      setUsers(formattedUsers);
    } catch (err: any) {
      console.error("Fetch Error:", err);
      const errorMessage = err.message || "Failed to load users";
      setError(errorMessage);

      // Fallback to mock data if API fails
      const mockUsers = [
        {
          _id: "68078a1cd6053d830528d29c",
          id: "68078a1cd6053d830528d29c",
          name: "samiya",
          email: "samiyamo1118@gmail.com",
          role: "student",
          status: "initial",
          verified: false,
          avatar: "/placeholder.svg?height=40&width=40",
          createdAt: "2025-04-22T12:22:52.143Z",
          updatedAt: "2025-04-22T12:22:52.143Z",
          subjects: [],
          verification_documents: [],
          permissions: [],
          __v: 0,
        },
        {
          _id: "6807f164fb12f4f3c6b5ba86",
          id: "6807f164fb12f4f3c6b5ba86",
          name: "Samiya Seid",
          email: "samiya.mohammedawol@aastustudent.edu.et",
          role: "tutor",
          status: "approved",
          verified: true,
          avatar: "/placeholder.svg?height=40&width=40",
          createdAt: "2025-04-22T19:43:32.231Z",
          updatedAt: "2025-05-09T21:15:39.057Z",
          subjects: [],
          verification_documents: [],
          permissions: [],
          __v: 1,
          ratings: [],
        },
        {
          _id: "6807f31bfb12f4f3c6b5ba90",
          id: "6807f31bfb12f4f3c6b5ba90",
          name: "miss",
          email: "samiyamohammed1118@gmail.com",
          role: "tutor",
          status: "rejected",
          verified: false,
          avatar: "/placeholder.svg?height=40&width=40",
          createdAt: "2025-04-22T19:50:51.378Z",
          updatedAt: "2025-05-09T21:16:37.912Z",
          subjects: [],
          verification_documents: [],
          permissions: [],
          __v: 1,
          ratings: [],
        },
        {
          _id: "681e72d6df4b2b9616aac511",
          id: "681e72d6df4b2b9616aac511",
          name: "tutor1 john",
          email: "tutor1@gmail.com",
          role: "tutor",
          status: "initial",
          verified: false,
          avatar: "/placeholder.svg?height=40&width=40",
          createdAt: "2025-05-09T21:25:42.324Z",
          updatedAt: "2025-05-09T21:25:42.324Z",
          subjects: [],
          verification_documents: [],
          permissions: [],
          __v: 0,
          ratings: [],
        },
        {
          _id: "681e40fe4f78fe98b6716d21",
          id: "681e40fe4f78fe98b6716d21",
          name: "admin one",
          email: "admin@gmail.com",
          role: "admin",
          status: "approved",
          verified: true,
          avatar: "/placeholder.svg?height=40&width=40",
          createdAt: "2025-05-09T17:53:02.693Z",
          updatedAt: "2025-05-09T17:53:02.693Z",
          subjects: [],
          verification_documents: [],
          permissions: [],
          __v: 0,
        },
      ];

      setUsers(mockUsers);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter.includes(user.role);
    const matchesStatus = statusFilter.includes(user.status);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleViewDocuments = (user: User) => {
    setSelectedUser(user);
    setViewingDocuments(true);
  };

  const handleBanUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE}/api/users/${userId}/ban`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedUser = await response.json();

      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, status: "banned" } : user
        )
      );

      toast({
        title: "User Banned",
        description: "The user has been successfully banned",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to ban user";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE}/api/users/${userId}/unban`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedUser = await response.json();

      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, status: "approved" } : user
        )
      );

      toast({
        title: "User Unbanned",
        description: "The user has been successfully unbanned",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to unban user";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    setSearchQuery("");
    setRoleFilter(["admin", "tutor", "student"]);
    setStatusFilter(["approved", "pending", "rejected", "initial"]);
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
                    Endpoint: {API_BASE}/api/users
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
                            status: "approved",
                            verified: true,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            phone: "+1234567890",
                            address: "123 Admin St",
                          },
                          {
                            _id: "dev-2",
                            id: "dev-2",
                            name: "Demo Tutor",
                            email: "tutor@example.com",
                            role: "tutor",
                            status: "pending",
                            verified: false,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            phone: "+1234567891",
                            address: "456 Tutor Ave",
                          },
                          {
                            _id: "dev-3",
                            id: "dev-3",
                            name: "Demo Student",
                            email: "student@example.com",
                            role: "student",
                            status: "approved",
                            verified: true,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            phone: "+1234567892",
                            address: "789 Student Blvd",
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
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
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
                      checked={statusFilter.includes("approved")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStatusFilter([...statusFilter, "approved"]);
                        } else {
                          setStatusFilter(
                            statusFilter.filter((s) => s !== "approved")
                          );
                        }
                      }}
                    >
                      Approved
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter.includes("pending")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStatusFilter([...statusFilter, "pending"]);
                        } else {
                          setStatusFilter(
                            statusFilter.filter((s) => s !== "pending")
                          );
                        }
                      }}
                    >
                      Pending
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter.includes("rejected")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStatusFilter([...statusFilter, "rejected"]);
                        } else {
                          setStatusFilter(
                            statusFilter.filter((s) => s !== "rejected")
                          );
                        }
                      }}
                    >
                      Rejected
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter.includes("initial")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStatusFilter([...statusFilter, "initial"]);
                        } else {
                          setStatusFilter(
                            statusFilter.filter((s) => s !== "initial")
                          );
                        }
                      }}
                    >
                      Initial
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
                                  user.status === "approved"
                                    ? "default"
                                    : user.status === "pending"
                                    ? "outline"
                                    : user.status === "rejected"
                                    ? "destructive"
                                    : "secondary"
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
                                  {user.role === "tutor" &&
                                    user.verification_documents?.length && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleViewDocuments(user)
                                        }
                                      >
                                        <FileText className="mr-2 h-4 w-4" />
                                        View Documents
                                      </DropdownMenuItem>
                                    )}
                                  <DropdownMenuSeparator />
                                  {user.status === "banned" ? (
                                    <DropdownMenuItem
                                      onClick={() => handleUnbanUser(user._id)}
                                    >
                                      <Check className="mr-2 h-4 w-4" />
                                      Unban User
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() => handleBanUser(user._id)}
                                    >
                                      <Ban className="mr-2 h-4 w-4" />
                                      Ban User
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
                  <DialogTitle className="flex justify-between items-center">
                    <span>User Details</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </DialogTitle>
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
                          <span>
                            {selectedUser.phone || "No phone provided"}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="text-sm">
                            {selectedUser.role}
                          </Badge>
                          <Badge
                            variant={
                              selectedUser.status === "approved"
                                ? "default"
                                : selectedUser.status === "pending"
                                ? "outline"
                                : selectedUser.status === "rejected"
                                ? "destructive"
                                : "secondary"
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
                                Address:
                              </span>
                              <span>
                                {selectedUser.address || "No address provided"}
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
                        {selectedUser.role === "tutor" && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-base flex items-center gap-2">
                              <FileText className="h-4 w-4" /> Tutor Information
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Subjects:
                                </span>
                                <span>
                                  {selectedUser.subjects?.length ? (
                                    <div className="flex flex-wrap gap-1">
                                      {selectedUser.subjects.map(
                                        (subject, i) => (
                                          <Badge
                                            key={i}
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {subject}
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  ) : (
                                    "None assigned"
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Verification Documents:
                                </span>
                                <span>
                                  {selectedUser.verification_documents
                                    ?.length || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedUser.role === "admin" && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-base flex items-center gap-2">
                              <Shield className="h-4 w-4" /> Admin Privileges
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Permissions:
                                </span>
                                <span>
                                  {selectedUser.permissions?.length ? (
                                    <div className="flex flex-wrap gap-1">
                                      {selectedUser.permissions.map(
                                        (perm, i) => (
                                          <Badge
                                            key={i}
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {perm}
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  ) : (
                                    "Full access"
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-6">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Close
                      </Button>
                      {selectedUser.role === "tutor" && (
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setIsDialogOpen(false);
                            handleViewDocuments(selectedUser);
                          }}
                        >
                          View Documents
                        </Button>
                      )}
                      {selectedUser.status !== "banned" ? (
                        <Button
                          variant="destructive"
                          onClick={() => handleBanUser(selectedUser._id)}
                        >
                          Ban User
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleUnbanUser(selectedUser._id)}
                        >
                          Unban User
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* View Documents Dialog */}
            <Dialog open={viewingDocuments} onOpenChange={setViewingDocuments}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Submitted Documents</DialogTitle>
                  <DialogDescription>
                    Review the documents submitted by {selectedUser?.name}
                  </DialogDescription>
                </DialogHeader>
                {selectedUser && selectedUser.verification_documents?.length ? (
                  <div className="space-y-4">
                    {selectedUser.verification_documents.map((doc, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {doc.name}
                          </CardTitle>
                          <CardDescription>{doc.size}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="h-40 bg-muted rounded-md flex items-center justify-center">
                            <FileText className="h-12 w-12 text-muted-foreground opacity-50" />
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDocument(doc)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No documents submitted
                  </p>
                )}
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setViewingDocuments(false)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Document Preview Dialog */}
            <Dialog
              open={!!selectedDocument}
              onOpenChange={(open) => !open && setSelectedDocument(null)}
            >
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Document Preview</DialogTitle>
                  <DialogDescription>
                    {selectedDocument?.name} ({selectedDocument?.size})
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="h-[60vh] bg-muted rounded-md flex flex-col items-center justify-center">
                    <FileText className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
                    <p className="text-muted-foreground">
                      Preview not available
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Download the document to view it
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open in New Tab
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
