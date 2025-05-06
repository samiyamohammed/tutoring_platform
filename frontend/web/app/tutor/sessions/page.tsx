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
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Course {
  _id: string;
  title: string;
}

interface Session {
  _id: string;
  student: User;
  tutor: User;
  course: Course;
  sessionType: "video" | "in-person";
  status: "pending" | "approved" | "declined" | "completed" | "cancelled";
  scheduledDate: string;
  startTime: string;
  endTime: string;
  videoConferenceLink?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function SessionsPage() {
  const router = useRouter();
  const { toast } = useToast();
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
  });

  useEffect(() => {
    console.log("Fetching sessions...");
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/session/tutor");
        console.log("API Response:", response);

        if (response.error) {
          console.error("API Error:", response.error);
          throw new Error(response.error);
        }

        setSessions(response.data || []);
        setFilteredSessions(response.data || []);
        console.log("Sessions data set successfully");
      } catch (error) {
        console.error("Error fetching sessions:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to fetch sessions",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [toast]);

  useEffect(() => {
    console.log("Applying filters and sorting...");
    let result = [...sessions];

    // Apply filters
    if (filter.status !== "all") {
      result = result.filter((session) => session.status === filter.status);
    }

    if (filter.type !== "all") {
      result = result.filter((session) => session.sessionType === filter.type);
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
        // @ts-ignore
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        // @ts-ignore
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredSessions(result);
    console.log("Filtered sessions:", result);
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
    status: "approved" | "declined" | "cancelled"
  ) => {
    console.log(`Changing session ${id} status to ${status}`);
    try {
      const response = await apiClient.put(`/session/${id}`, { status });
      console.log("Status change response:", response);

      if (response.error) {
        throw new Error(response.error);
      }

      toast({ title: `Session ${status} successfully` });
      setSessions(
        sessions.map((session) =>
          session._id === id ? { ...session, status } : session
        )
      );
    } catch (error) {
      console.error("Error changing session status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${status} session`,
      });
    }
  };

  const handleDeleteSession = async (id: string) => {
    console.log(`Deleting session ${id}`);
    try {
      const response = await apiClient.delete(`/session/${id}`);
      console.log("Delete response:", response);

      if (response.error) {
        throw new Error(response.error);
      }

      toast({ title: "Session deleted successfully" });
      setSessions(sessions.filter((session) => session._id !== id));
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete session",
      });
    }
  };

  const handleStartSession = (session: Session) => {
    console.log("Starting session:", session);
    if (session.sessionType === "video" && session.videoConferenceLink) {
      window.open(session.videoConferenceLink, "_blank");
    } else {
      router.push(`/session/${session._id}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`;
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const durationMinutes =
      endHour * 60 + endMinute - (startHour * 60 + startMinute);
    return `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`;
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
        {status}
      </span>
    );
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
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sessions">Upcoming Sessions</TabsTrigger>
                <TabsTrigger value="requests">Session Requests</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
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
                  onChange={(e) =>
                    setFilter({ ...filter, type: e.target.value })
                  }
                >
                  <option value="all">All Types</option>
                  <option value="video">Online</option>
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
                              {formatTimeRange(
                                request.startTime,
                                request.endTime
                              )}
                            </TableCell>
                            <TableCell>
                              {calculateDuration(
                                request.startTime,
                                request.endTime
                              )}
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
                                  onClick={() =>
                                    handleStatusChange(request._id, "declined")
                                  }
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
                              {formatTimeRange(
                                session.startTime,
                                session.endTime
                              )}
                            </TableCell>
                            <TableCell>
                              {calculateDuration(
                                session.startTime,
                                session.endTime
                              )}
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
