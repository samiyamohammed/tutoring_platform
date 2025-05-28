"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TutorSidebar } from "@/components/tutor-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, X, Check, List, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  pricing: {
    online?: {
      schedule: any[];
    };
    group?: {
      price: number;
      maxStudents: number;
      schedule: any[];
    };
    oneOnOne?: {
      price: number;
      maxStudents: number;
      schedule: any[];
    };
  };
  sessionTypes: string[];
}

interface Session {
  _id: string;
  student: User;
  tutor: User;
  course: Course;
  sessionType: "video" | "in-person" | "group" | "oneOnOne";
  status: "pending" | "approved" | "declined" | "completed" | "cancelled";
  scheduledDate: string;
  startTime: string;
  endTime: string;
  videoConferenceLink?: string;
  notes?: string;
  rejectionReason?: string;
  requestDate: string;
  createdAt: string;
  updatedAt: string;
}

export default function SessionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("sessions");
  const [calendarView, setCalendarView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: string;
  } | null>(null);
  const [filter, setFilter] = useState({
    status: "all",
    type: "all",
    dateRange: "all",
    sessionFormat: "all",
  });
  const [declineReason, setDeclineReason] = useState("");
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:5000/api/session/tutor",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        const validatedSessions = data.map((session: any) => ({
          ...session,
          startTime: session.startTime || "",
          endTime: session.endTime || "",
          scheduledDate: session.scheduledDate || new Date().toISOString(),
        }));

        setSessions(validatedSessions);
        setFilteredSessions(validatedSessions);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to fetch sessions"
        );
        setSessions([]);
        setFilteredSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  useEffect(() => {
    let result = [...sessions];

    // Apply filters
    if (filter.status !== "all") {
      result = result.filter((session) => session.status === filter.status);
    }

    if (filter.type !== "all") {
      result = result.filter((session) => {
        if (filter.type === "video") return session.sessionType === "video";
        if (filter.type === "in-person")
          return session.sessionType === "in-person";
        if (filter.type === "group") return session.sessionType === "group";
        if (filter.type === "oneOnOne")
          return session.sessionType === "oneOnOne";
        return true;
      });
    }

    if (filter.sessionFormat !== "all") {
      result = result.filter((session) => {
        if (filter.sessionFormat === "online")
          return session.sessionType === "video";
        if (filter.sessionFormat === "in-person")
          return session.sessionType === "in-person";
        return true;
      });
    }

    if (filter.dateRange !== "all") {
      const now = new Date();
      result = result.filter((session) => {
        const sessionDate = new Date(session.scheduledDate);

        switch (filter.dateRange) {
          case "upcoming":
            return sessionDate >= now;
          case "past":
            return sessionDate < now;
          case "today":
            return (
              sessionDate.getDate() === now.getDate() &&
              sessionDate.getMonth() === now.getMonth() &&
              sessionDate.getFullYear() === now.getFullYear()
            );
          default:
            return true;
        }
      });
    }

    // Apply sorting
    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aValue: any, bValue: any;

        if (sortConfig.key.includes(".")) {
          const keys = sortConfig.key.split(".");
          aValue = keys.reduce((obj: any, key) => obj?.[key], a);
          bValue = keys.reduce((obj: any, key) => obj?.[key], b);
        } else {
          aValue = a[sortConfig.key as keyof Session];
          bValue = b[sortConfig.key as keyof Session];
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredSessions(result);
  }, [filter, sessions, sortConfig]);

  const requestSort = (key: string) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleStatusChange = async (
    id: string,
    status: "approved" | "declined" | "cancelled",
    reason?: string
  ) => {
    try {
      const payload: {
        status: "approved" | "declined" | "cancelled";
        rejectionReason?: string;
      } = { status };
      if (status === "declined" && reason) {
        payload.rejectionReason = reason;
      }

      const response = await fetch(`http://localhost:5000/api/session/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      toast(`Session ${status} successfully`);
      setSessions(
        sessions.map((session) =>
          session._id === id
            ? { ...session, status, rejectionReason: reason || "" }
            : session
        )
      );

      if (status === "declined") {
        setShowDeclineModal(false);
        setDeclineReason("");
      }
    } catch (error) {
      console.error("Error changing session status:", error);
      toast.error(
        error instanceof Error ? error.message : `Failed to ${status} session`
      );
    }
  };

  const openDeclineModal = (id: string) => {
    setCurrentSessionId(id);
    setShowDeclineModal(true);
  };

  const handleDeleteSession = async (id: string) => {
    try {
      const response = await apiClient.delete(`/session/${id}`);

      if (response.error) {
        throw new Error(response.error);
      }

      toast("Session deleted successfully");
      setSessions(sessions.filter((session) => session._id !== id));
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete session"
      );
    }
  };

  const handleStartSession = (session: Session) => {
    if (session.sessionType === "video" && session.videoConferenceLink) {
      window.open(session.videoConferenceLink, "_blank");
    } else {
      router.push(`/tutor/video-session/${session._id}`);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? "Invalid Date"
        : date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
    } catch {
      return "Invalid Date";
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "N/A";

    try {
      if (timeString.includes("T")) {
        const date = new Date(timeString);
        return isNaN(date.getTime())
          ? "Invalid Time"
          : date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });
      } else {
        const [hours, minutes] = timeString.split(":");
        const date = new Date();
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch {
      return "Invalid Time";
    }
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    const start = formatTime(startTime);
    const end = formatTime(endTime);
    return `${start} - ${end}`;
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    try {
      if (!startTime || !endTime) return "N/A";

      let startDate: Date, endDate: Date;

      if (startTime.includes("T") && endTime.includes("T")) {
        startDate = new Date(startTime);
        endDate = new Date(endTime);
      } else {
        const [startHours, startMins] = startTime.split(":").map(Number);
        const [endHours, endMins] = endTime.split(":").map(Number);

        startDate = new Date();
        startDate.setHours(startHours, startMins, 0, 0);

        endDate = new Date();
        endDate.setHours(endHours, endMins, 0, 0);

        if (endDate < startDate) {
          endDate.setDate(endDate.getDate() + 1);
        }
      }

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return "Invalid Duration";
      }

      const durationMinutes =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60);
      const hours = Math.floor(durationMinutes / 60);
      const minutes = Math.round(durationMinutes % 60);

      return `${hours}h ${minutes}m`;
    } catch {
      return "Invalid Duration";
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      declined: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusClasses[status as keyof typeof statusClasses]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getSessionTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      video: "Online",
      "in-person": "In-Person",
      group: "Group",
      oneOnOne: "1-on-1",
    };
    return typeMap[type] || type;
  };

  const pendingRequests = sessions.filter(
    (session) => session.status === "pending"
  );
  const upcomingSessions = filteredSessions.filter((session) =>
    ["approved", "pending"].includes(session.status)
  );

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <TutorSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">Sessions</h1>
              <p className="text-sm text-muted-foreground">
                Manage your tutoring sessions
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setCalendarView(!calendarView)}
              >
                {calendarView ? (
                  <>
                    <List size={16} />
                    List View
                  </>
                ) : (
                  <>
                    <Calendar size={16} />
                    Calendar View
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => router.push("/tutor/schedule")}
              >
                <Calendar size={16} />
                Schedule New Session
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-4 p-8 pt-6">
            {showDeclineModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-md w-full">
                  <h3 className="text-lg font-medium mb-4">
                    Decline Session Request
                  </h3>
                  <textarea
                    className="w-full p-2 border rounded mb-4"
                    placeholder="Optional reason for declining..."
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDeclineModal(false);
                        setDeclineReason("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        handleStatusChange(
                          currentSessionId,
                          "declined",
                          declineReason
                        )
                      }
                    >
                      Confirm Decline
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sessions">Upcoming Sessions</TabsTrigger>
                <TabsTrigger value="requests">Session Requests</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap gap-2 items-center mb-4">
              <select
                className="p-2 border rounded text-sm"
                value={filter.status}
                onChange={(e) =>
                  setFilter({ ...filter, status: e.target.value })
                }
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                className="p-2 border rounded text-sm"
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              >
                <option value="all">All Session Types</option>
                <option value="group">Group</option>
                <option value="oneOnOne">1-on-1</option>
              </select>

              <select
                className="p-2 border rounded text-sm"
                value={filter.sessionFormat}
                onChange={(e) =>
                  setFilter({ ...filter, sessionFormat: e.target.value })
                }
              >
                <option value="all">All Formats</option>
                <option value="online">Online</option>
                <option value="in-person">In-Person</option>
              </select>

              <select
                className="p-2 border rounded text-sm"
                value={filter.dateRange}
                onChange={(e) =>
                  setFilter({ ...filter, dateRange: e.target.value })
                }
              >
                <option value="all">All Dates</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
                <option value="today">Today</option>
              </select>
            </div>

            {calendarView ? (
              <Card>
                <CardHeader>
                  <CardTitle>Calendar View</CardTitle>
                  <CardDescription>
                    View your sessions in a calendar format
                  </CardDescription>
                </CardHeader>
                <CardContent className="min-h-[400px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    Calendar view will be implemented here
                  </div>
                </CardContent>
              </Card>
            ) : activeTab === "requests" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Session Requests</CardTitle>
                  <CardDescription>
                    Pending session requests from students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : pendingRequests.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => requestSort("student.name")}
                          >
                            <div className="flex items-center">
                              Student
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => requestSort("course.title")}
                          >
                            <div className="flex items-center">
                              Course
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => requestSort("scheduledDate")}
                          >
                            <div className="flex items-center">
                              Date
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Format</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingRequests.map((request) => (
                          <TableRow key={request._id}>
                            <TableCell>{request.student.name}</TableCell>
                            <TableCell>{request.course.title}</TableCell>
                            <TableCell>
                              {formatDate(request.scheduledDate)}
                            </TableCell>
                            <TableCell>
                              {request.startTime && request.endTime
                                ? formatTimeRange(
                                    request.startTime,
                                    request.endTime
                                  )
                                : formatTime(request.scheduledDate)}
                            </TableCell>
                            <TableCell>
                              {request.startTime && request.endTime
                                ? calculateDuration(
                                    request.startTime,
                                    request.endTime
                                  )
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {getSessionTypeDisplay(request.sessionType)}
                            </TableCell>
                            <TableCell>
                              {request.sessionType === "video"
                                ? "Online"
                                : "In-Person"}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive"
                                  onClick={() => openDeclineModal(request._id)}
                                >
                                  <X size={16} className="mr-1" />
                                  Decline
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleStatusChange(request._id, "approved")
                                  }
                                >
                                  <Check size={16} className="mr-1" />
                                  Approve
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No pending session requests
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Sessions</CardTitle>
                  <CardDescription>
                    Your scheduled tutoring sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : upcomingSessions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => requestSort("student.name")}
                          >
                            <div className="flex items-center">
                              Student
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => requestSort("course.title")}
                          >
                            <div className="flex items-center">
                              Course
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer"
                            onClick={() => requestSort("scheduledDate")}
                          >
                            <div className="flex items-center">
                              Date
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Format</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {upcomingSessions.map((session) => (
                          <TableRow key={session._id}>
                            <TableCell>{session.student.name}</TableCell>
                            <TableCell>{session.course.title}</TableCell>
                            <TableCell>
                              {formatDate(session.scheduledDate)}
                            </TableCell>
                            <TableCell>
                              {session.startTime && session.endTime
                                ? formatTimeRange(
                                    session.startTime,
                                    session.endTime
                                  )
                                : formatTime(session.scheduledDate)}
                            </TableCell>
                            <TableCell>
                              {session.startTime && session.endTime
                                ? calculateDuration(
                                    session.startTime,
                                    session.endTime
                                  )
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              {getSessionTypeDisplay(session.sessionType)}
                            </TableCell>
                            <TableCell>
                              {session.sessionType === "video"
                                ? "Online"
                                : "In-Person"}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(session.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {session.status === "approved" && (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleStartSession(session)}
                                  >
                                    Start
                                  </Button>
                                )}
                                {["pending", "approved"].includes(
                                  session.status
                                ) && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleStatusChange(
                                        session._id,
                                        "cancelled"
                                      )
                                    }
                                  >
                                    Cancel
                                  </Button>
                                )}
                                {[
                                  "declined",
                                  "cancelled",
                                  "completed",
                                ].includes(session.status) && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive"
                                    onClick={() =>
                                      handleDeleteSession(session._id)
                                    }
                                  >
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No upcoming sessions found
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
