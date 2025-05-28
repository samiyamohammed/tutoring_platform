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
import page from "@/app/page";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type HelpRequest = {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: "pending" | "in_progress" | "resolved" | "closed";
  createdAt: string;
  updatedAt?: string;
  __v?: number;
};

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const router = useRouter();
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(
    null
  );
  // Update the useEffect data fetching logic
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pageSize.toString(),
          search: searchTerm,
          sortBy: sortConfig?.key || "createdAt",
          sortOrder: sortConfig?.direction === "ascending" ? "asc" : "desc",
        });

        const response = await fetchWithToken(`/api/help?${params.toString()}`);

        if (response?.success) {
          setHelpRequests(response.data);
          // Ensure your backend returns totalCount for proper pagination
          setTotalCount(response.totalCount || response.data.length);
        } else {
          setHelpRequests([]);
          setTotalCount(0);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load requests"
        );
        setHelpRequests([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchData, 300);
    return () => clearTimeout(debounceTimer);
  }, [page, pageSize, searchTerm, sortConfig?.key, sortConfig?.direction]);

  async function fetchWithToken(
    endpoint: string,
    method: string = "GET",
    body?: any
  ) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      };

      const response = await fetch(`${baseUrl}${endpoint}`, fetchOptions);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
        const error = await response.json();
        throw new Error(error.message || "Request failed");
      }

      return response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

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

      // Optimistic update
      setHelpRequests((prev) =>
        prev.map((req) =>
          req._id === requestId
            ? { ...req, status: newStatus as HelpRequest["status"] }
            : req
        )
      );

      const response = await fetchWithToken(
        `/api/help/${requestId}/status`,
        "PUT",
        { status: newStatus }
      );

      if (!response?.success) {
        throw new Error(response?.error || "Status update failed");
      }

      // Update with server data if needed
      setHelpRequests((prev) =>
        prev.map((req) => (req._id === requestId ? response.data : req))
      );
    } catch (err) {
      // Revert on error
      setHelpRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: req.status } : req
        )
      );

      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const sortedRequests = [...(helpRequests || [])].sort((a, b) => {
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

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortConfig.direction === "ascending"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortConfig.direction === "ascending"
      ? Number(aValue) - Number(bValue)
      : Number(bValue) - Number(aValue);
  });

  const filteredRequests = sortedRequests.filter((request) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      request.message.toLowerCase().includes(searchLower) ||
      request.status.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
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

  // Export help requests as CSV
  const handleExport = () => {
    if (!helpRequests.length) return;
    const headers = [
      "Date",
      "User",
      "ID",
      "Email",
      "Message",
      "Status",
      "Updated At",
    ];
    const rows = helpRequests.map((request) => [
      formatDate(request.createdAt),
      request.name,
      request._id,
      request.email,
      request.message.replace(/\n/g, " "),
      request.status,
      request.updatedAt ? formatDate(request.updatedAt) : "",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((field) =>
            typeof field === "string" && field.includes(",")
              ? `"${field.replace(/"/g, '""')}"`
              : field
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "help_requests.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            {/* <div className="flex items-center gap-2">
              <Button variant="outline" disabled={loading}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div> */}
          </div>

          <div className="flex-1 space-y-4 p-8 pt-6 overflow-auto">
            <Card>
              <CardHeader>
                <CardTitle>Help & Support Requests</CardTitle>
                <CardDescription>
                  Manage help and support requests from users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center justify-between">
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
                  <Button
                    variant="outline"
                    onClick={handleExport}
                    disabled={loading || helpRequests.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
                <Dialog
                  open={!!selectedRequest}
                  onOpenChange={() => setSelectedRequest(null)}
                >
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Request Details</DialogTitle>
                      <DialogDescription>
                        Full details of the help request
                      </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
                              Name
                            </h4>
                            <p className="font-medium">
                              {selectedRequest.name}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
                              Email
                            </h4>
                            <a
                              href={`mailto:${selectedRequest.email}`}
                              className="text-primary hover:underline"
                            >
                              {selectedRequest.email}
                            </a>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Message
                          </h4>
                          <div className="p-4 bg-muted/50 rounded-lg mt-2">
                            <p className="whitespace-pre-wrap">
                              {selectedRequest.message}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground">
                              Submitted
                            </h4>
                            <p>{formatDate(selectedRequest.createdAt)}</p>
                          </div>
                          {selectedRequest.updatedAt && (
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground">
                                Last Updated
                              </h4>
                              <p>{formatDate(selectedRequest.updatedAt)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

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
                        <TableHead>ID</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow
                          key={request._id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <TableCell className="whitespace-nowrap">
                            {formatDate(request.createdAt)}
                            {request.updatedAt && (
                              <div className="text-xs text-muted-foreground">
                                Updated: {formatDate(request.updatedAt)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {request.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{request._id}</Badge>
                          </TableCell>
                          <TableCell>
                            <a
                              href={`mailto:${request.email}`}
                              className="text-primary hover:underline"
                            >
                              {request.email}
                            </a>
                          </TableCell>
                          <TableCell className="max-w-xs truncate hover:whitespace-normal">
                            {request.message}
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
              <CardFooter className="flex justify-between items-center">
                <div className="text-xs text-muted-foreground">
                  Showing <strong>{filteredRequests.length}</strong> requests
                </div>
                {/* <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1 || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={helpRequests.length < pageSize || loading}
                  >
                    Next
                  </Button>
                </div> */}
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
