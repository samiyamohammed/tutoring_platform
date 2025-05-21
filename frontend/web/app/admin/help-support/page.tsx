"use client";

import { useState, useEffect } from "react";
import {
  HelpCircle,
  Loader2,
  AlertCircle,
  ArrowUpDown,
  Search,
  ChevronDown,
  MessageSquare,
  Flag,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

type User = {
  _id: string;
  name: string;
  email: string;
  role: "student" | "tutor" | "admin";
};

type HelpRequest = {
  _id: string;
  user: User;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: string;
  updatedAt?: string;
};

const API_BASE = "http://localhost:5000/api";

// Demo data
const DEMO_HELP_REQUESTS: HelpRequest[] = [
  {
    _id: "1",
    user: {
      _id: "user1",
      name: "John Doe",
      email: "john@example.com",
      role: "student",
    },
    subject: "Cannot access my course",
    message: "I'm unable to access the React course I purchased last week",
    status: "open",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "2",
    user: {
      _id: "user2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "student",
    },
    subject: "Payment issue",
    message: "I was charged twice for my subscription",
    status: "in_progress",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "3",
    user: {
      _id: "user3",
      name: "Alex Johnson",
      email: "alex@example.com",
      role: "tutor",
    },
    subject: "Dashboard not loading",
    message: "The tutor dashboard shows error 500 when I try to access it",
    status: "resolved",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

async function fetchWithToken(endpoint: string) {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      if (response.status === 404) {
        return null;
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Request failed");
    }

    return response.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    return null;
  }
}

export default function HelpSupportPage() {
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof HelpRequest;
    direction: "ascending" | "descending";
  } | null>({ key: "createdAt", direction: "descending" });
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>(
    {}
  );
  const [usingDemoData, setUsingDemoData] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchHelpRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        setUsingDemoData(false);

        const helpRequestsData = await fetchWithToken("/help-support");

        if (!helpRequestsData) {
          setUsingDemoData(true);
          setHelpRequests(DEMO_HELP_REQUESTS);
        } else {
          setHelpRequests(helpRequestsData as HelpRequest[]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setUsingDemoData(true);
        setHelpRequests(DEMO_HELP_REQUESTS);
      } finally {
        setLoading(false);
      }
    };

    fetchHelpRequests();
  }, [router]);

  const handleSort = (key: keyof HelpRequest) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      setUpdatingStatus((prev) => ({ ...prev, [requestId]: true }));

      // For demo purposes, we'll just update the local state
      setHelpRequests((prevRequests) =>
        prevRequests.map((request) =>
          request._id === requestId
            ? {
                ...request,
                status: newStatus as HelpRequest["status"],
                updatedAt: new Date().toISOString(),
              }
            : request
        )
      );

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update request status"
      );
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const sortedRequests = [...helpRequests].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = a[sortConfig.key] ?? "";
    const bValue = b[sortConfig.key] ?? "";

    if (sortConfig.key === "createdAt" || sortConfig.key === "updatedAt") {
      const dateA = new Date(aValue as string).getTime();
      const dateB = new Date(bValue as string).getTime();
      return sortConfig.direction === "ascending"
        ? dateA - dateB
        : dateB - dateA;
    }

    if (aValue < bValue) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const filteredRequests = sortedRequests.filter((request) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      request.user.name.toLowerCase().includes(searchLower) ||
      request.user.email.toLowerCase().includes(searchLower) ||
      request.subject.toLowerCase().includes(searchLower) ||
      request.message.toLowerCase().includes(searchLower) ||
      request.status.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="secondary">Open</Badge>;
      case "in_progress":
        return <Badge variant="default">In Progress</Badge>;
      case "resolved":
        return <Badge variant="outline">Resolved</Badge>;
      case "closed":
        return <Badge variant="destructive">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="destructive" className="w-[400px]">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <AdminSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex space-x-4">
              <Button asChild variant="ghost">
                <Link href="/admin/reports">
                  <Flag className="mr-2 h-4 w-4" />
                  Reports
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/admin/feedbacks">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Feedbacks
                </Link>
              </Button>
              <Button asChild variant="default">
                <Link href="/admin/help-support">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Support
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={loading}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-4 p-8 pt-6 overflow-auto">
            <Card>
              <CardHeader>
                <CardTitle>Help & Support Requests</CardTitle>
                <CardDescription>
                  {usingDemoData && (
                    <span className="text-yellow-600">
                      Note: Using demo data as help requests API is not
                      available
                    </span>
                  )}
                  {!usingDemoData &&
                    "Manage help and support requests from users"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center">
                  <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search requests..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredRequests.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => handleSort("createdAt")}
                            className="p-0 hover:bg-transparent"
                          >
                            Date
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => handleSort("status")}
                            className="p-0 hover:bg-transparent"
                          >
                            Status
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow key={request._id}>
                          <TableCell className="whitespace-nowrap">
                            {formatDate(request.createdAt)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {request.user.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{request.user.role}</Badge>
                          </TableCell>
                          <TableCell>{request.user.email}</TableCell>
                          <TableCell>{request.subject}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {request.message}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={request.status}
                              onValueChange={(value) =>
                                handleStatusChange(request._id, value)
                              }
                              disabled={updatingStatus[request._id]}
                            >
                              <SelectTrigger className="w-[150px]">
                                {updatingStatus[request._id] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <SelectValue placeholder="Select status" />
                                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                  </>
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">
                                  In Progress
                                </SelectItem>
                                <SelectItem value="resolved">
                                  Resolved
                                </SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <HelpCircle className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">
                      {searchTerm
                        ? "No matching requests found"
                        : "No help requests available"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm
                        ? "Try a different search term"
                        : "All requests have been processed"}
                    </p>
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        className="mt-2"
                        onClick={() => setSearchTerm("")}
                      >
                        Clear search
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  Showing <strong>{filteredRequests.length}</strong> of{" "}
                  <strong>{helpRequests.length}</strong> requests
                </div>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
