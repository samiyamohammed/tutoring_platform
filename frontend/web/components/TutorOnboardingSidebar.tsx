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

export function TutorOnboardingSidebar() {
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

  // Allowed routes during onboarding
  const allowedRoutes = ["/tutor/profile", "/tutor/documents"];
  const isRouteAllowed = (path: string) => allowedRoutes.includes(path);

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
              {/* Dashboard - Disabled during onboarding */}
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
                      </SidebarMenuButton>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Please wait for approval to access this page.
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>

              {/* My Courses - Disabled during onboarding */}
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
                      </SidebarMenuButton>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Complete onboarding to access
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>

              {/* Create Course - Disabled during onboarding */}
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
                      </SidebarMenuButton>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Complete onboarding to access
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>

              {/* My Students - Disabled during onboarding */}
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
                      </SidebarMenuButton>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Complete onboarding to access
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>

              {/* Video Sessions - Disabled during onboarding */}
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
                      </SidebarMenuButton>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Complete onboarding to access
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>

              {/* Schedule - Disabled during onboarding */}
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
                      </SidebarMenuButton>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Complete onboarding to access
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>

              {/* Documents - Allowed during onboarding */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/tutor/documents")}
                >
                  <Link href="/tutor/documents">
                    <FileText className="h-4 w-4" />
                    <span>Documents</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Earnings - Disabled during onboarding */}
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
                      </SidebarMenuButton>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Complete onboarding to access
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>

              {/* Verification - Disabled during onboarding */}
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
                      </SidebarMenuButton>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Complete onboarding to access
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>

              {/* Settings - Disabled during onboarding */}
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
                      </SidebarMenuButton>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Complete onboarding to access
                  </TooltipContent>
                </Tooltip>
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
