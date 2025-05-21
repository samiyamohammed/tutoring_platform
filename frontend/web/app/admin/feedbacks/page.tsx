"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Loader2,
  AlertCircle,
  ArrowUpDown,
  Search,
  Download,
  Flag,
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

type User = {
  _id: string;
  name: string;
  email: string;
  role: "student" | "tutor" | "admin";
};

type Feedback = {
  _id: string;
  user: User;
  message: string;
  createdAt: string;
};

const API_BASE = "http://localhost:5000/api";

// Demo data
const DEMO_FEEDBACKS: Feedback[] = [
  {
    _id: "1",
    user: {
      _id: "user1",
      name: "John Doe",
      email: "john@example.com",
      role: "student",
    },
    message: "The course content was very helpful and well-structured.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "2",
    user: {
      _id: "user2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "tutor",
    },
    message: "The platform needs more features for course management.",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "3",
    user: {
      _id: "user3",
      name: "Alex Johnson",
      email: "alex@example.com",
      role: "student",
    },
    message: "The video quality could be improved in some lessons.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "4",
    user: {
      _id: "user4",
      name: "Sarah Williams",
      email: "sarah@example.com",
      role: "student",
    },
    message: "The discussion forums are very helpful for learning.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
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

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Feedback;
    direction: "ascending" | "descending";
  } | null>({ key: "createdAt", direction: "descending" });
  const [usingDemoData, setUsingDemoData] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        setError(null);
        setUsingDemoData(false);

        const feedbacksData = await fetchWithToken("/feedbacks");

        if (!feedbacksData) {
          setUsingDemoData(true);
          setFeedbacks(DEMO_FEEDBACKS);
        } else {
          setFeedbacks(feedbacksData as Feedback[]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setUsingDemoData(true);
        setFeedbacks(DEMO_FEEDBACKS);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [router]);

  const handleSort = (key: keyof Feedback) => {
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

  const sortedFeedbacks = [...feedbacks].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = a[sortConfig.key] ?? "";
    const bValue = b[sortConfig.key] ?? "";

    if (sortConfig.key === "createdAt") {
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

  const filteredFeedbacks = sortedFeedbacks.filter((feedback) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      feedback.user.name.toLowerCase().includes(searchLower) ||
      feedback.user.email.toLowerCase().includes(searchLower) ||
      feedback.message.toLowerCase().includes(searchLower)
    );
  });

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
              <Button asChild variant="default">
                <Link href="/admin/feedbacks">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Feedbacks
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-2"></div>
          </div>

          <div className="flex-1 space-y-4 p-8 pt-6 overflow-auto">
            <Card>
              <CardHeader>
                <CardTitle>All Feedbacks</CardTitle>
                <CardDescription>
                  {usingDemoData && (
                    <span className="text-yellow-600">
                      Note: Using demo data as feedbacks API is not available
                    </span>
                  )}
                  {!usingDemoData && "Review feedbacks submitted by users"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center">
                  <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search feedbacks..."
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
                ) : filteredFeedbacks.length > 0 ? (
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
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFeedbacks.map((feedback) => (
                        <TableRow key={feedback._id}>
                          <TableCell className="whitespace-nowrap">
                            {formatDate(feedback.createdAt)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {feedback.user.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {feedback.user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{feedback.user.email}</TableCell>
                          <TableCell className="max-w-lg">
                            {feedback.message}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">
                      {searchTerm
                        ? "No matching feedbacks found"
                        : "No feedbacks available"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm
                        ? "Try a different search term"
                        : "No feedbacks have been submitted yet"}
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
                  Showing <strong>{filteredFeedbacks.length}</strong> of{" "}
                  <strong>{feedbacks.length}</strong> feedbacks
                </div>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
