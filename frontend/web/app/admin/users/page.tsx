"use client"

import { useState } from "react"
import Link from "next/link"
import { Ban, Check, Eye, Filter, MoreHorizontal, Search, Shield, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for users
const users = [
  {
    id: "USR001",
    name: "John Smith",
    email: "john.smith@example.com",
    role: "tutor",
    status: "active",
    verified: true,
    joinedAt: "2023-01-15T10:30:00Z",
    lastActive: "2023-05-14T15:45:00Z",
    courses: 4,
    students: 68,
    rating: 4.8,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "USR002",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    role: "tutor",
    status: "active",
    verified: true,
    joinedAt: "2023-02-10T09:15:00Z",
    lastActive: "2023-05-13T11:20:00Z",
    courses: 3,
    students: 42,
    rating: 4.7,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "USR003",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    role: "tutor",
    status: "pending",
    verified: false,
    joinedAt: "2023-05-05T14:20:00Z",
    lastActive: "2023-05-05T14:20:00Z",
    courses: 0,
    students: 0,
    rating: 0,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "USR004",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    role: "student",
    status: "active",
    verified: true,
    joinedAt: "2023-03-20T11:45:00Z",
    lastActive: "2023-05-14T09:30:00Z",
    enrolledCourses: 3,
    completedCourses: 1,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "USR005",
    name: "Robert Wilson",
    email: "robert.wilson@example.com",
    role: "student",
    status: "active",
    verified: true,
    joinedAt: "2023-02-28T16:10:00Z",
    lastActive: "2023-05-12T13:15:00Z",
    enrolledCourses: 2,
    completedCourses: 0,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "USR006",
    name: "Jennifer Lee",
    email: "jennifer.lee@example.com",
    role: "tutor",
    status: "banned",
    verified: true,
    joinedAt: "2023-01-05T08:30:00Z",
    lastActive: "2023-04-20T10:45:00Z",
    courses: 2,
    students: 35,
    rating: 4.2,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "USR007",
    name: "David Miller",
    email: "david.miller@example.com",
    role: "student",
    status: "banned",
    verified: true,
    joinedAt: "2023-03-10T13:20:00Z",
    lastActive: "2023-04-15T09:10:00Z",
    enrolledCourses: 1,
    completedCourses: 0,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "USR008",
    name: "Admin User",
    email: "admin@educonnect.com",
    role: "admin",
    status: "active",
    verified: true,
    joinedAt: "2023-01-01T00:00:00Z",
    lastActive: "2023-05-14T16:30:00Z",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  // Filter users based on search query and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
      case "oldest":
        return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
      case "lastActive":
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
      case "nameAsc":
        return a.name.localeCompare(b.name)
      case "nameDesc":
        return b.name.localeCompare(a.name)
      default:
        return 0
    }
  })

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <AdminSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">User Management</h1>
              <p className="text-sm text-muted-foreground">Manage users, tutors, and administrators</p>
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
                    <SelectItem value="active">Active</SelectItem>
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
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="lastActive">Last Active</SelectItem>
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
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.role === "admin" ? "default" : user.role === "tutor" ? "secondary" : "outline"
                              }
                            >
                              {user.role === "admin" && <Shield className="mr-1 h-3 w-3" />}
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.status === "active"
                                  ? "default"
                                  : user.status === "pending"
                                    ? "outline"
                                    : "destructive"
                              }
                            >
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(user.joinedAt).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(user.lastActive).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/users/${user.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </Link>
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
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
