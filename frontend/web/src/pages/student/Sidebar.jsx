"use client"

import { useState, useRef, useEffect } from "react"
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
  Settings,
  ChevronUp,
  ChevronDown,
  UserCircle,
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
import { Separator } from "@/components/ui/separator"

const DashboardSidebar = ({ onLogout, userName = "John Doe", userRole = "Student" }) => {
  const location = useLocation()
  const [open, setOpen] = useState(true)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileMenuRef = useRef(null)
  const profileButtonRef = useRef(null)

  // Get initials for avatar fallback
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

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

  // Profile menu options
  const profileOptions = [
    {
      name: "Profile",
      icon: UserCircle,
      path: "/student/profile",
      action: () => {
        setShowProfileMenu(false)
      },
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/student/settings",
      action: () => {
        setShowProfileMenu(false)
      },
    },
    {
      name: "Logout",
      icon: LogOut,
      path: null,
      action: () => {
        setShowProfileMenu(false)
        onLogout && onLogout()
      },
      variant: "destructive",
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
        <div className={`px-4 ${open ? "block" : "flex justify-center"} relative`}>
          <div
            ref={profileButtonRef}
            className={`flex ${open ? "items-center gap-3 p-2" : "justify-center"} rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer`}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <Avatar className="h-10 w-10 border-2 border-emerald-800">
              <AvatarImage src="/placeholder.svg" alt={userName} />
              <AvatarFallback className="bg-emerald-800 text-white">{getInitials(userName)}</AvatarFallback>
            </Avatar>
            {open && (
              <div className="flex flex-1 items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{userName}</span>
                  <span className="text-xs text-muted-foreground">{userRole}</span>
                </div>
                {showProfileMenu ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            )}
          </div>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div
              ref={profileMenuRef}
              className={`absolute ${open ? "left-0 right-0 mx-4" : "left-full ml-2"} bottom-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50`}
              style={{ minWidth: open ? "auto" : "180px" }}
            >
              <div className="py-2">
                {profileOptions.map((option, index) => (
                  <div key={index}>
                    {option.path ? (
                      <Link
                        to={option.path}
                        className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 ${option.variant === "destructive" ? "text-red-600 hover:bg-red-50" : ""}`}
                        onClick={option.action}
                      >
                        <option.icon className="h-4 w-4" />
                        <span>{option.name}</span>
                      </Link>
                    ) : (
                      <button
                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-left ${option.variant === "destructive" ? "text-red-600 hover:bg-red-50" : ""}`}
                        onClick={option.action}
                      >
                        <option.icon className="h-4 w-4" />
                        <span>{option.name}</span>
                      </button>
                    )}
                    {index < profileOptions.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Removed the standalone logout button since it's now in the dropdown */}
      </SidebarFooter>
    </Sidebar>
  )
}

export default DashboardSidebar

