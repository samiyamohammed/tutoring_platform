"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  BookOpen,
  Calendar,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Search,
  Users,
  Bell,
  User,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const DashboardSidebar = ({ onLogout, userName = "John Doe", userRole = "Student" }) => {
  const location = useLocation()
  const [open, setOpen] = useState(true)

  // Get initials for avatar fallback
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const routes = [
    {
      path: "/student/dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      path: "/student/mycourses",
      name: "My Courses",
      icon: BookOpen,
    },
    {
      path: "/student/browsecourse",
      name: "Browse Courses",
      icon: Search,
    },
    {
      path: "/student/assignment",
      name: "Assignments",
      icon: FileText,
    },
    {
      path: "/student/quizzes",
      name: "Quizzes",
      icon: HelpCircle,
    },
    {
      path: "/student/sessions",
      name: "Sessions",
      icon: Calendar,
    },
    {
      path: "/student/findtutor",
      name: "Find Tutors",
      icon: Users,
    },

  ]

  return (
    <Sidebar className="border-r border-r-gray-200" variant="sidebar" collapsible="icon" onOpenChange={setOpen}>
      <SidebarHeader className="py-6">
        <div className="flex items-center justify-center gap-2 px-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center">
            <span className="text-white font-bold text-lg">ED</span>
          </div>
          {open && (
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-emerald-800">EduConnect</h2>
              <p className="text-xs text-muted-foreground">Learning Platform</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <Separator className="mb-4" />

      <SidebarContent>
        <SidebarMenu>
          {routes.map((route) => {
            const Icon = route.icon
            const isActive = location.pathname === route.path

            return (
              <SidebarMenuItem key={route.path}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={`${isActive ? "bg-emerald-800/10 text-emerald-800 font-medium" : ""}`}
                  tooltip={route.name}
                >
                  <Link to={route.path}>
                    <Icon className={`${isActive ? "text-emerald-800" : ""}`} />
                    <span>{route.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="space-y-4">
        <div className={`px-4 ${open ? "block" : "flex justify-center"}`}>
          <div className={`flex ${open ? "items-center gap-3 p-2" : "justify-center"} rounded-lg bg-gray-100`}>
            <Avatar className="h-10 w-10 border-2 border-emerald-800">
              <AvatarImage src="/placeholder.svg" alt={userName} />
              <AvatarFallback className="bg-emerald-800 text-white">{getInitials(userName)}</AvatarFallback>
            </Avatar>
            {open && (
              <div className="flex flex-col">
                <span className="font-medium text-sm">{userName}</span>
                <span className="text-xs text-muted-foreground">{userRole}</span>
              </div>
            )}
          </div>
        </div>

        <Button variant="destructive" className="w-full bg-red-800 hover:bg-red-700 text-white" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          {open && "Log out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}

export default DashboardSidebar

