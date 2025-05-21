"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  AlertCircle,
} from "lucide-react";

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
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TutorRejectedSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{
    firstName?: string;
    lastName?: string;
    id?: string;
  } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push(`/auth/signin`);
  };

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  // Only profile is allowed for rejected tutors
  const isRouteAllowed = (path: string) => path === "/tutor/profile";

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
              {/* Dashboard - Disabled for rejected tutors */}
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <SidebarMenuButton
                        isActive={isActive("/tutor/dashboard")}
                        disabled={!isRouteAllowed("/tutor/dashboard")}
                        className="opacity-50 cursor-not-allowed"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                        <AlertCircle className="ml-auto h-4 w-4 text-red-500" />
                      </SidebarMenuButton>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="text-red-500">
                      <p>Your account has been rejected.</p>
                      <p>Please contact support for more information.</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>

              {/* My Courses - Disabled for rejected tutors */}
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <SidebarMenuButton
                        isActive={isActive("/tutor/courses")}
                        disabled={!isRouteAllowed("/tutor/courses")}
                        className="opacity-50 cursor-not-allowed"
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>My Courses</span>
                        <AlertCircle className="ml-auto h-4 w-4 text-red-500" />
                      </SidebarMenuButton>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="text-red-500">
                      <p>Your account has been rejected.</p>
                      <p>Please contact support for more information.</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>

              {/* Create Course - Disabled for rejected tutors */}
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <SidebarMenuButton
                        isActive={isActive("/tutor/create-course")}
                        disabled={!isRouteAllowed("/tutor/create-course")}
                        className="opacity-50 cursor-not-allowed"
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span>Create Course</span>
                        <AlertCircle className="ml-auto h-4 w-4 text-red-500" />
                      </SidebarMenuButton>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="text-red-500">
                      <p>Your account has been rejected.</p>
                      <p>Please contact support for more information.</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>

              {/* My Students - Disabled for rejected tutors */}
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <SidebarMenuButton
                        isActive={isActive("/tutor/students")}
                        disabled={!isRouteAllowed("/tutor/students")}
                        className="opacity-50 cursor-not-allowed"
                      >
                        <Users className="h-4 w-4" />
                        <span>My Students</span>
                        <AlertCircle className="ml-auto h-4 w-4 text-red-500" />
                      </SidebarMenuButton>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="text-red-500">
                      <p>Your account has been rejected.</p>
                      <p>Please contact support for more information.</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>

              {/* Video Sessions - Disabled for rejected tutors */}
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <SidebarMenuButton
                        isActive={isActive("/tutor/video-session")}
                        disabled={!isRouteAllowed("/tutor/video-session")}
                        className="opacity-50 cursor-not-allowed"
                      >
                        <Video className="h-4 w-4" />
                        <span>Video Sessions</span>
                        <AlertCircle className="ml-auto h-4 w-4 text-red-500" />
                      </SidebarMenuButton>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="text-red-500">
                      <p>Your account has been rejected.</p>
                      <p>Please contact support for more information.</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>

              {/* Schedule - Disabled for rejected tutors */}
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <SidebarMenuButton
                        isActive={isActive("/tutor/schedule")}
                        disabled={!isRouteAllowed("/tutor/schedule")}
                        className="opacity-50 cursor-not-allowed"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Schedule</span>
                        <AlertCircle className="ml-auto h-4 w-4 text-red-500" />
                      </SidebarMenuButton>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="text-red-500">
                      <p>Your account has been rejected.</p>
                      <p>Please contact support for more information.</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>

              {/* Documents - Disabled for rejected tutors */}
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <SidebarMenuButton
                        isActive={isActive("/tutor/documents")}
                        disabled={!isRouteAllowed("/tutor/documents")}
                        className="opacity-50 cursor-not-allowed"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Documents</span>
                        <AlertCircle className="ml-auto h-4 w-4 text-red-500" />
                      </SidebarMenuButton>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="text-red-500">
                      <p>Your account has been rejected.</p>
                      <p>Please contact support for more information.</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>

              {/* Earnings - Disabled for rejected tutors */}
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <SidebarMenuButton
                        isActive={isActive("/tutor/earnings")}
                        disabled={!isRouteAllowed("/tutor/earnings")}
                        className="opacity-50 cursor-not-allowed"
                      >
                        <DollarSign className="h-4 w-4" />
                        <span>Earnings</span>
                        <AlertCircle className="ml-auto h-4 w-4 text-red-500" />
                      </SidebarMenuButton>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="text-red-500">
                      <p>Your account has been rejected.</p>
                      <p>Please contact support for more information.</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>

              {/* Verification - Disabled for rejected tutors */}
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <SidebarMenuButton
                        isActive={isActive("/tutor/verification")}
                        disabled={!isRouteAllowed("/tutor/verification")}
                        className="opacity-50 cursor-not-allowed"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Verification</span>
                        <AlertCircle className="ml-auto h-4 w-4 text-red-500" />
                      </SidebarMenuButton>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="text-red-500">
                      <p>Your account has been rejected.</p>
                      <p>Please contact support for more information.</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>

              {/* Settings - Disabled for rejected tutors */}
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <SidebarMenuButton
                        isActive={isActive("/tutor/settings")}
                        disabled={!isRouteAllowed("/tutor/settings")}
                        className="opacity-50 cursor-not-allowed"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                        <AlertCircle className="ml-auto h-4 w-4 text-red-500" />
                      </SidebarMenuButton>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="text-red-500">
                      <p>Your account has been rejected.</p>
                      <p>Please contact support for more information.</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>

              {/* Profile - Only allowed route for rejected tutors */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/tutor/profile")}
                >
                  <Link href="/tutor/profile">
                    <Settings className="h-4 w-4" />
                    <span>Profile</span>
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
                <AvatarImage
                  src={`https://avatar.vercel.sh/${user?.id || "user"}`}
                />
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
            <DropdownMenuItem disabled>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
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
  );
}
