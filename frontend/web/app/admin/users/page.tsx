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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/dropdown-menu";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  verified: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  subjects?: string[];
  verification_documents?: string[];
  permissions?: string[];
  __v?: number;
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("nameAsc");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/users");

        const formattedUsers = response.map((user: any) => ({
          id: user._id,
          name: user.name || "Unknown User",
          email: user.email || "no-email@example.com",
          role: user.role?.toLowerCase() || "user",
          status:
            user.verification_status?.toLowerCase() ||
            user.status?.toLowerCase() ||
            "pending",
          verified:
            user.verified ||
            user.verification_status === "verified" ||
            user.status === "verified",
          avatar: user.avatar || "/placeholder.svg?height=40&width=40",
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          subjects: user.subjects || [],
          verification_documents: user.verification_documents || [],
          permissions: user.permissions || [],
          __v: user.__v || 0,
        }));

        setUsers(formattedUsers);
        setError(null);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch users");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case "nameAsc":
        return a.name.localeCompare(b.name);
      case "nameDesc":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <AdminSidebar />
          <main className="flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h1 className="text-lg font-semibold">User Management</h1>
                <p className="text-sm text-muted-foreground">
                  Manage users, tutors, and administrators
                </p>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">Loading users...</div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <AdminSidebar />
          <main className="flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h1 className="text-lg font-semibold">User Management</h1>
                <p className="text-sm text-muted-foreground">
                  Manage users, tutors, and administrators
                </p>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-destructive">
                <p>Error loading users</p>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <AdminSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">User Management</h1>
              <p className="text-sm text-muted-foreground">
                Manage users, tutors, and administrators
              </p>
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
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="tutor">Tutor</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nameAsc">Name (A-Z)</SelectItem>
                    <SelectItem value="nameDesc">Name (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  More Filters
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader className="py-4">
                <CardTitle>Users ({filteredUsers.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
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
                    {sortedUsers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedUsers.map((user) => (
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
                                user.status === "verified"
                                  ? "default"
                                  : user.status === "pending"
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
                                <DropdownMenuItem>
                                  <User className="mr-2 h-4 w-4" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.status === "banned" ? (
                                  <DropdownMenuItem>
                                    <Check className="mr-2 h-4 w-4" />
                                    Unban User
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem>
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
              </CardContent>
            </Card>

            {/* Enhanced User Details Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-[850px]">
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
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
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
                        <p className="text-sm text-muted-foreground">
                          {selectedUser.email}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="text-sm">
                            {selectedUser.role}
                          </Badge>
                          <Badge
                            variant={
                              selectedUser.status === "verified"
                                ? "default"
                                : selectedUser.status === "pending"
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column */}
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

                        {/* Tutor Specific Info */}
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

                        {/* Admin Specific Info */}
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

                      {/* Right Column */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-base flex items-center gap-2">
                            <Lock className="h-4 w-4" /> Account Security
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Password Last Changed:
                              </span>
                              <span>
                                {new Date(
                                  selectedUser.updatedAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-base flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> Verification Status
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Status:
                              </span>
                              <span className="capitalize">
                                {selectedUser.status}
                              </span>
                            </div>
                            {selectedUser.role === "tutor" && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Documents Submitted:
                                </span>
                                <span>
                                  {selectedUser.verification_documents
                                    ?.length || 0}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-base flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" /> System Info
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                API Version:
                              </span>
                              <span>v{selectedUser.__v}</span>
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
                      {selectedUser.role === "tutor" && (
                        <Button variant="secondary">View Documents</Button>
                      )}
                      <Button>Edit Profile</Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
