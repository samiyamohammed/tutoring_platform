"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BookOpen,
  Calendar,
  ChevronDown,
  Clock,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Star,
  Video,
  Bell,
  MessageSquare,
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
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { io } from "socket.io-client"

export function StudentSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ firstName?: string; lastName?: string; id?: string } | null>(null)
  const [hasNewNotifications, setHasNewNotifications] = useState(false)
  const [hasNewMessages, setHasNewMessages] = useState(false)
  const [socket, setSocket] = useState<any>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:5000", {
      withCredentials: true,
      auth: {
        token: localStorage.getItem("token"),
      },
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!socket) return

    socket.on("new-notification", () => {
      setHasNewNotifications(true)
    })

    socket.on("new-message", () => {
      setHasNewMessages(true)
    })

    const checkStatus = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/notifications/unread-count")
        const data = await res.json()
        if (data.count > 0) setHasNewNotifications(true)

        const messagesRes = await fetch("http://localhost:5000/api/messages/unread-count")
        const messagesData = await messagesRes.json()
        if (messagesData.count > 0) setHasNewMessages(true)
      } catch (error) {
        console.error("Error checking notification/message status:", error)
      }
    }

    checkStatus()

    return () => {
      socket.off("new-notification")
      socket.off("new-message")
    }
  }, [socket])

  const handleLogout = () => {
    if (socket) socket.disconnect()
    localStorage.clear()
    router.push("/auth/signin")
  }

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  const handleNotificationClick = () => {
    setHasNewNotifications(false)
    router.push("/student/notifications")
  }

  const handleMessageClick = () => {
    setHasNewMessages(false)
    router.push("/student/messages")
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
                <div className="flex gap-2 px-4 py-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={handleNotificationClick}
                  >
                    <Bell className="h-4 w-4" />
                    {hasNewNotifications && (
                      <Badge className="absolute -right-1 -top-1 h-3 w-3 p-0 bg-red-500" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={handleMessageClick}
                  >
                    <MessageSquare className="h-4 w-4" />
                    {hasNewMessages && (
                      <Badge className="absolute -right-1 -top-1 h-3 w-3 p-0 bg-blue-500" />
                    )}
                  </Button>
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/student/dashboard")}>
                  <Link href="/student/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/student/explore")}>
                  <Link href="/student/explore">
                    <Search className="h-4 w-4" />
                    <span>Explore Courses</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/student/my-courses")}>
                  <Link href="/student/my-courses">
                    <BookOpen className="h-4 w-4" />
                    <span>My Courses</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/student/video-session")}>
                  <Link href="/student/video-session">
                    <Video className="h-4 w-4" />
                    <span>Video Sessions</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/student/schedule")}>
                  <Link href="/student/schedule">
                    <Calendar className="h-4 w-4" />
                    <span>My Schedule</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/student/certificates")}>
                  <Link href="/student/certificates">
                    <GraduationCap className="h-4 w-4" />
                    <span>Certificates</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/student/waiting-list")}>
                  <Link href="/student/waiting-list">
                    <Clock className="h-4 w-4" />
                    <span>Waiting List</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/student/settings")}>
                  <Link href="/student/settings">
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
              <Link href="/student/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/student/settings">Settings</Link>
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
