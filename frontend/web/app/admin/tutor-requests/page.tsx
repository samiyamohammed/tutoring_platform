"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Check,
  ChevronDown,
  Eye,
  FileText,
  Search,
  Download,
  ExternalLink,
  ImageIcon,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

interface VerificationDocument {
  url: string;
  _id: string;
  name: string;
  type?: string;
  size?: number;
}

interface Tutor {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  verification_status: "initial" | "requested" | "approved" | "rejected";
  verification_documents?: VerificationDocument[];
  qualification?: string;
  experience?: number;
  subjects?: string[];
  rejectionReason?: string;
}

const reviewSchema = z
  .object({
    status: z.enum(["approved", "rejected", "requested"]),
    comments: z.string().optional(),
    rejectionReason: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.status === "rejected" &&
      (!data.rejectionReason || data.rejectionReason.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Rejection reason is required when rejecting a request",
        path: ["rejectionReason"],
      });
    }
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function TutorRequestsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([
    "requested",
    "approved",
    "rejected",
  ]);
  const [tutorRequests, setTutorRequests] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Tutor | null>(null);
  const [viewingDocuments, setViewingDocuments] = useState(false);
  const [reviewingRequest, setReviewingRequest] = useState(false);
  const [viewingDetails, setViewingDetails] = useState(false);
  const [selectedDocument, setSelectedDocument] =
    useState<VerificationDocument | null>(null);
  const [previewingDocument, setPreviewingDocument] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<VerificationDocument | null>(
    null
  );
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [showDocumentsList, setShowDocumentsList] = useState(false);

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      status: "approved",
      comments: "",
      rejectionReason: "",
    },
  });

  //useEffect(() => {
  //   console.log(
  //     "Selected request docs:",
  //     selectedRequest?.verification_documents
  //   );
  // }, [selectedRequest]);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(`${baseUrl}/api/users/tutors`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            throw new Error("Session expired. Please log in again.");
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const mappedTutors = data.map((tutor: any) => ({
          _id: tutor._id,
          name: tutor.name,
          email: tutor.email,
          createdAt: tutor.createdAt,
          verification_status: tutor.verification_status,
          verification_documents: tutor.verification_documents || [],
          qualification: tutor.qualification,
          experience: tutor.experience,
          subjects: tutor.subjects,
          rejectionReason: tutor.rejectionReason,
        }));

        setTutorRequests(mappedTutors);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch tutors";
        setError(errorMessage);

        if (errorMessage.includes("Session expired")) {
          toast({
            title: "Session Expired",
            description: "Please log in again",
            variant: "destructive",
          });
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, [toast, router]);

  const filteredRequests = tutorRequests.filter((request) => {
    const matchesSearch =
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter.includes(request.verification_status);
    return matchesSearch && matchesStatus;
  });

  const handleViewRequest = (request: Tutor) => {
    setSelectedRequest(request);
    setViewingDetails(true);
  };

  // const handleViewDocuments = (request: Tutor) => {
  //   setSelectedRequest(request);
  //   setViewingDocuments(true);
  // };

  const handleReviewRequest = (request: Tutor) => {
    setSelectedRequest(request);
    setReviewingRequest(true);
    form.reset({ status: "approved", comments: "", rejectionReason: "" });
  };

  const handlePreviewDocument = async (doc: VerificationDocument) => {
    try {
      setIsLoadingDoc(true);
      setSelectedDoc(doc);

      // Check if we already have a blob URL
      if (doc.url.startsWith("blob:")) {
        setIsLoadingDoc(false);
        return;
      }

      // Construct the full URL
      const fullUrl = doc.url.startsWith("http")
        ? doc.url
        : `${baseUrl}${doc.url.startsWith("/") ? "" : "/"}${
            doc.url
          }`;

      // Check if document is PDF
      const isPdf = doc.type?.includes("pdf") || doc.url?.endsWith(".pdf");

      if (isPdf) {
        setSelectedDoc({
          ...doc,
          url: fullUrl,
          type: doc.type || "application/pdf",
        });
        return;
      }

      // For non-PDF files (images), fetch and create blob URL
      const res = await fetch(fullUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch document: ${res.status}`);

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      setSelectedDoc({
        ...doc,
        url: blobUrl,
        type:
          doc.type ||
          res.headers.get("content-type") ||
          "application/octet-stream",
      });
    } catch (error) {
      console.error("Preview error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load document preview",
      });
    } finally {
      setIsLoadingDoc(false);
    }
  };

  const onSubmitReview = async (values: z.infer<typeof reviewSchema>) => {
    if (!selectedRequest) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `${baseUrl}/api/users/${selectedRequest._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            verification_status: values.status,
            // Match backend expectation exactly
            verification_rejection_reason:
              values.status === "rejected" ? values.rejectionReason : null,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`
        );
      }

      // Update local state to match backend field names
      setTutorRequests((prev) =>
        prev.map((tutor) =>
          tutor._id === selectedRequest._id
            ? {
                ...tutor,
                verification_status: values.status,
                rejectionReason:
                  values.status === "rejected"
                    ? values.rejectionReason
                    : undefined,
              }
            : tutor
        )
      );

      toast({
        title: `Request ${
          values.status === "approved" ? "approved" : "rejected"
        }`,
        description: `Tutor ${selectedRequest.name} has been ${values.status}.`,
      });

      setReviewingRequest(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update tutor status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <AdminSidebar />
          <main className="flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <p>Loading tutor requests...</p>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <AdminSidebar />
          <main className="flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <p className="text-destructive text-center">{error}</p>
              {error.includes("Session expired") && (
                <Button onClick={() => router.push("/login")}>
                  Go to Login
                </Button>
              )}
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <AdminSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">
                Tutor Verification Requests
              </h1>
              <p className="text-sm text-muted-foreground">
                Review and manage tutor verification requests
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search requests..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      Status <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {["requested", "approved", "rejected", "initial"].map(
                      (status) => (
                        <DropdownMenuCheckboxItem
                          key={status}
                          checked={statusFilter.includes(status)}
                          onCheckedChange={(checked) => {
                            setStatusFilter(
                              checked
                                ? [...statusFilter, status]
                                : statusFilter.filter((s) => s !== status)
                            );
                          }}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </DropdownMenuCheckboxItem>
                      )
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Requests</TabsTrigger>
                <TabsTrigger value="requested">
                  Pending (
                  {
                    tutorRequests.filter(
                      (r) => r.verification_status === "requested"
                    ).length
                  }
                  )
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved (
                  {
                    tutorRequests.filter(
                      (r) => r.verification_status === "approved"
                    ).length
                  }
                  )
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected (
                  {
                    tutorRequests.filter(
                      (r) => r.verification_status === "rejected"
                    ).length
                  }
                  )
                </TabsTrigger>
              </TabsList>

              {["all", "requested", "approved", "rejected"].map((tab) => (
                <TabsContent key={tab} value={tab} className="space-y-4">
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Tutor</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Documents</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRequests
                            .filter(
                              (r) =>
                                tab === "all" || r.verification_status === tab
                            )
                            .map((request) => (
                              <TableRow key={request._id}>
                                <TableCell className="font-medium">
                                  {request._id}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage
                                        src={`https://avatar.vercel.sh/${request.email}`}
                                      />
                                      <AvatarFallback>
                                        {request.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">
                                        {request.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {request.email}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    request.createdAt
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      request.verification_status === "approved"
                                        ? "default"
                                        : request.verification_status ===
                                          "rejected"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                  >
                                    {request.verification_status.toUpperCase()}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {request.verification_documents?.length || 0}{" "}
                                  files
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleViewRequest(request)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setSelectedRequest(request); 
                                        setShowDocumentsList(true); 
                                      }}
                                      title="View all documents"
                                    >
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                    {request.verification_status ===
                                      "requested" && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          handleReviewRequest(request)
                                        }
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </main>
      </div>

      {/* Dialogs */}
      {/* Documents List Dialog */}
      <Dialog open={showDocumentsList} onOpenChange={setShowDocumentsList}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verification Documents</DialogTitle>
            <DialogDescription>
              {selectedRequest?.name}'s submitted files
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {selectedRequest?.verification_documents?.map((doc) => (
              <div
                key={doc._id}
                className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  handlePreviewDocument(doc);
                  setShowDocumentsList(false);
                }}
              >
                <div className="flex items-center gap-2">
                  {doc.type?.includes("pdf") ? (
                    <FileText className="h-4 w-4 text-red-500" />
                  ) : (
                    <ImageIcon className="h-4 w-4 text-blue-500" />
                  )}
                  <span>{doc.name}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={viewingDetails} onOpenChange={setViewingDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Tutor Details</DialogTitle>
            <DialogDescription>
              Review tutor information and documents
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${selectedRequest.email}`}
                  />
                  <AvatarFallback>
                    {selectedRequest.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedRequest.name}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedRequest.email}
                  </p>
                  <Badge
                    variant={
                      selectedRequest.verification_status === "approved"
                        ? "default"
                        : selectedRequest.verification_status === "rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {selectedRequest.verification_status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Subjects</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.subjects?.map((subject, index) => (
                      <Badge key={index} variant="outline">
                        {subject}
                      </Badge>
                    )) || "No subjects provided"}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Qualifications</h4>
                  <p className="text-sm">
                    {selectedRequest.qualification ||
                      "No qualifications provided"}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Experience</h4>
                  <p className="text-sm">
                    {selectedRequest.experience
                      ? `${selectedRequest.experience} years`
                      : "No experience provided"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Documents</h4>
                <div className="space-y-2">
                  {selectedRequest?.verification_documents?.map((doc) => (
                    <div
                      key={doc._id}
                      className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 cursor-pointer"
                      onClick={() => handlePreviewDocument(doc)}
                    >
                      <div className="flex items-center gap-2">
                        {doc.type?.includes("pdf") ? (
                          <FileText className="h-4 w-4 text-red-500" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-blue-500" />
                        )}
                        <span>{doc.name}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        Preview
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button onClick={() => setViewingDetails(false)}>Close</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedDoc}
        onOpenChange={(open) => !open && setSelectedDoc(null)}
      >
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedDoc?.name}</DialogTitle>
            <DialogDescription>
              {selectedDoc?.type?.includes("pdf")
                ? "PDF Preview"
                : "Document Preview"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-auto">
            {isLoadingDoc ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center space-y-2">
                  <svg
                    className="animate-spin h-8 w-8 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p>Loading document...</p>
                </div>
              </div>
            ) : selectedDoc?.type?.includes("pdf") ||
              selectedDoc?.url?.endsWith(".pdf") ? (
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer
                  fileUrl={selectedDoc.url}
                  httpHeaders={{
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  }}
                  renderError={(error) => (
                    <div className="flex flex-col items-center justify-center h-full space-y-4 p-4">
                      <FileText className="h-12 w-12 text-red-500" />
                      <p className="text-red-500 text-center">
                        Failed to load PDF: {error.message}
                      </p>
                      <div className="flex gap-2">
                        <Button asChild variant="outline">
                          <a href={selectedDoc.url} download>
                            <Download className="h-4 w-4 mr-2" /> Download
                          </a>
                        </Button>
                        <Button asChild variant="default">
                          <a
                            href={selectedDoc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open in new tab
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                />
              </Worker>
            ) : (
              <div className="flex items-center justify-center h-full">
                <img
                  src={selectedDoc?.url}
                  alt={selectedDoc?.name}
                  className="object-contain max-h-full max-w-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/placeholder-document-error.png";
                  }}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button asChild variant="outline">
              <a href={selectedDoc?.url} download>
                <Download className="h-4 w-4 mr-2" /> Download
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reviewingRequest} onOpenChange={setReviewingRequest}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Tutor Request</DialogTitle>
            <DialogDescription>
              Approve or reject {selectedRequest?.name}'s verification request
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitReview)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Decision</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="approved" />
                          </FormControl>
                          <FormLabel className="font-normal">Approve</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="rejected" />
                          </FormControl>
                          <FormLabel className="font-normal">Reject</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("status") === "rejected" && (
                <FormField
                  control={form.control}
                  name="rejectionReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rejection Reason</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a reason for rejection..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReviewingRequest(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {form.watch("status") === "approved" ? "Approve" : "Reject"}{" "}
                  Request
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}