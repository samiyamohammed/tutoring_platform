"use client";

import { useState, useEffect } from "react";
import {
  Flag,
  Loader2,
  AlertCircle,
  ArrowUpDown,
  Search,
  ChevronDown,
  MessageSquare,
  ChevronRight,
  Download,
  HelpCircle,
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

type Report = {
  _id: string;
  reporter: User;
  reportedItem: {
    type: string;
    id: string;
    title?: string;
  };
  reason: string;
  status: "open" | "in_progress" | "resolved" | "rejected";
  createdAt: string;
  updatedAt?: string;
};

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// Demo data
const DEMO_REPORTS: Report[] = [
  {
    _id: "1",
    reporter: {
      _id: "user1",
      name: "John Doe",
      email: "john@example.com",
      role: "student",
    },
    reportedItem: {
      type: "course",
      id: "course1",
      title: "Introduction to React",
    },
    reason: "Inappropriate content in lesson 5",
    status: "open",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "2",
    reporter: {
      _id: "user2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "student",
    },
    reportedItem: {
      type: "user",
      id: "user3",
    },
    reason: "Spamming messages in discussions",
    status: "in_progress",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "3",
    reporter: {
      _id: "user3",
      name: "Alex Johnson",
      email: "alex@example.com",
      role: "student",
    },
    reportedItem: {
      type: "course",
      id: "course2",
      title: "Advanced JavaScript",
    },
    reason: "Incorrect information in quiz answers",
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
    const response = await fetch(`${baseUrl}${endpoint}`, {
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

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Report;
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

    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        setUsingDemoData(false);

        const reportsData = await fetchWithToken("/reports");

        if (!reportsData) {
          setUsingDemoData(true);
          setReports(DEMO_REPORTS);
        } else {
          setReports(reportsData as Report[]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setUsingDemoData(true);
        setReports(DEMO_REPORTS);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [router]);

  const handleSort = (key: keyof Report) => {
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

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    try {
      setUpdatingStatus((prev) => ({ ...prev, [reportId]: true }));

      // For demo purposes, we'll just update the local state
      setReports((prevReports) =>
        prevReports.map((report) =>
          report._id === reportId
            ? {
                ...report,
                status: newStatus as Report["status"],
                updatedAt: new Date().toISOString(),
              }
            : report
        )
      );

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update report status"
      );
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [reportId]: false }));
    }
  };

  const sortedReports = [...reports].sort((a, b) => {
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

  const filteredReports = sortedReports.filter((report) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      report.reporter.name.toLowerCase().includes(searchLower) ||
      report.reporter.email.toLowerCase().includes(searchLower) ||
      report.reason.toLowerCase().includes(searchLower) ||
      (report.reportedItem.title &&
        report.reportedItem.title.toLowerCase().includes(searchLower)) ||
      report.status.toLowerCase().includes(searchLower)
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
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
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
              <Button asChild variant="default">
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
              <Button asChild variant="ghost">
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
                <CardTitle>All Reports</CardTitle>
                <CardDescription>
                  {usingDemoData && (
                    <span className="text-yellow-600">
                      Note: Using demo data as reports API is not available
                    </span>
                  )}
                  {!usingDemoData &&
                    "Review and manage reports submitted by students"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center">
                  <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reports..."
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
                ) : filteredReports.length > 0 ? (
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
                        <TableHead>Reason</TableHead>
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
                      {filteredReports.map((report) => (
                        <TableRow key={report._id}>
                          <TableCell className="whitespace-nowrap">
                            {formatDate(report.createdAt)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {report.reporter.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {report.reporter.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{report.reporter.email}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {report.reason}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={report.status}
                              onValueChange={(value) =>
                                handleStatusChange(report._id, value)
                              }
                              disabled={updatingStatus[report._id]}
                            >
                              <SelectTrigger className="w-[150px]">
                                {updatingStatus[report._id] ? (
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
                                <SelectItem value="rejected">
                                  Rejected
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Flag className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">
                      {searchTerm
                        ? "No matching reports found"
                        : "No reports available"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm
                        ? "Try a different search term"
                        : "All reports have been processed"}
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
                  Showing <strong>{filteredReports.length}</strong> of{" "}
                  <strong>{reports.length}</strong> reports
                </div>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
