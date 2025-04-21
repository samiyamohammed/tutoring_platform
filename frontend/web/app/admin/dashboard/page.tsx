"use client"

import { useState } from "react"
import Link from "next/link"
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  DollarSign,
  Download,
  FileCheck,
  Flag,
  LineChart,
  PieChart,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState("week")

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <AdminSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Platform overview and statistics</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">Last 30 days</SelectItem>
                  <SelectItem value="year">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,543</div>
                  <p className="text-xs text-muted-foreground">+180 from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">152</div>
                  <p className="text-xs text-muted-foreground">+24 from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tutor Requests</CardTitle>
                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18</div>
                  <p className="text-xs text-muted-foreground">8 pending review</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$48,352.00</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
            </div>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-4">
                    <CardHeader>
                      <CardTitle>User Growth</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                      <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                        <LineChart className="h-16 w-16 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="col-span-3">
                    <CardHeader>
                      <CardTitle>User Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                      <div className="h-[300px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                        <PieChart className="h-16 w-16 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-3">
                    <CardHeader>
                      <CardTitle>Pending Tutor Requests</CardTitle>
                      <CardDescription>Tutors waiting for verification</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                          <div key={i} className="flex items-center">
                            <div className="flex items-center justify-center rounded-md border p-2 mr-4">
                              <FileCheck className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium leading-none">John Doe</p>
                              <p className="text-sm text-muted-foreground">
                                Submitted: {i + 1} day{i > 0 ? "s" : ""} ago
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href="/admin/tutor-requests">
                                <ChevronRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/admin/tutor-requests">View All Requests</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                  <Card className="col-span-4">
                    <CardHeader>
                      <CardTitle>Recent Reports</CardTitle>
                      <CardDescription>Reports submitted by users</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                          <div key={i} className="flex items-center">
                            <div className="flex items-center justify-center rounded-md border p-2 mr-4">
                              <Flag className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {["Inappropriate content", "Scam attempt", "Harassment"][i]}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Reported by: Jane Doe • Course: Web Development
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href="/admin/reports">
                                <ChevronRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/admin/reports">View All Reports</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>User Analytics</CardTitle>
                    <CardDescription>User growth and engagement metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[400px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                      <LineChart className="h-16 w-16 text-muted-foreground" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download Report
                    </Button>
                    <Button asChild>
                      <Link href="/admin/users">View All Users</Link>
                    </Button>
                  </CardFooter>
                </Card>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Roles</CardTitle>
                      <CardDescription>Distribution of users by role</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                        <PieChart className="h-16 w-16 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>User Activity</CardTitle>
                      <CardDescription>Active users over time</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                        <BarChart3 className="h-16 w-16 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="courses" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Analytics</CardTitle>
                    <CardDescription>Course enrollment and completion metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[400px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                      <BarChart3 className="h-16 w-16 text-muted-foreground" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download Report
                    </Button>
                    <Button asChild>
                      <Link href="/admin/courses">Manage Courses</Link>
                    </Button>
                  </CardFooter>
                </Card>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Course Categories</CardTitle>
                      <CardDescription>Distribution of courses by category</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                        <PieChart className="h-16 w-16 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Course Ratings</CardTitle>
                      <CardDescription>Average ratings by course category</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                        <BarChart3 className="h-16 w-16 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="reports" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Report Analytics</CardTitle>
                    <CardDescription>Overview of user reports and issues</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[400px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                      <LineChart className="h-16 w-16 text-muted-foreground" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download Report
                    </Button>
                    <Button asChild>
                      <Link href="/admin/reports">View All Reports</Link>
                    </Button>
                  </CardFooter>
                </Card>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Report Types</CardTitle>
                      <CardDescription>Distribution of reports by type</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                        <PieChart className="h-16 w-16 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Resolution Time</CardTitle>
                      <CardDescription>Average time to resolve reports</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                      <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                        <BarChart3 className="h-16 w-16 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
