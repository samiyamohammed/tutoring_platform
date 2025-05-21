"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BookOpen,
  Calendar,
  ChevronDown,
  CheckCircle,
  DollarSign,
  FileText,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Settings,
  Users,
  Video,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function TutorSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ firstName?: string; lastName?: string; id?: string } | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    router.push(`/auth/signin`)
  }

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-3">
          <BookOpen className="h-6 w-6" />
          <span className="font-bold">EduConnect</span>
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/tutor/dashboard")}>
                  <Link href="/tutor/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/tutor/courses")}>
                  <Link href="/tutor/courses">
                    <BookOpen className="h-4 w-4" />
                    <span>My Courses</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/tutor/create-course")}>
                  <Link href="/tutor/create-course">
                    <PlusCircle className="h-4 w-4" />
                    <span>Create Course</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/tutor/students")}>
                  <Link href="/tutor/students">
                    <Users className="h-4 w-4" />
                    <span>My Students</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/tutor/video-session")}>
                  <Link href="/tutor/video-session">
                    <Video className="h-4 w-4" />
                    <span>Video Sessions</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/tutor/schedule")}>
                  <Link href="/tutor/schedule">
                    <Calendar className="h-4 w-4" />
                    <span>Schedule</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/tutor/documents")}>
                  <Link href="/tutor/documents">
                    <FileText className="h-4 w-4" />
                    <span>Documents</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/tutor/earnings")}>
                  <Link href="/tutor/earnings">
                    <DollarSign className="h-4 w-4" />
                    <span>Earnings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/tutor/verification")}>
                  <Link href="/tutor/verification">
                    <CheckCircle className="h-4 w-4" />
                    <span>Verification</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/tutor/settings")}>
                  <Link href="/tutor/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start px-2">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={`https://avatar.vercel.sh/${user?.id || "user"}`} />
                <AvatarFallback>
                  {user?.firstName?.charAt(0) || "U"}
                  {user?.lastName?.charAt(0) || ""}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">
                {user?.firstName} {user?.lastName}
              </span>
              <ChevronDown className="ml-auto h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            <DropdownMenuItem asChild>
              <Link href="/tutor/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/tutor/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
