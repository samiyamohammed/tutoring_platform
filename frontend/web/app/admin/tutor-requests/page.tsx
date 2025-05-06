"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Check, ChevronDown, Eye, FileText, Search, Download, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const tutorRequests = [
  {
    id: "TR-001",
    name: "John Smith",
    email: "john.smith@example.com",
    submittedAt: "2023-04-15T10:35:00Z",
    status: "pending",
    documents: [
      { name: "ID_Card.pdf", size: "1.2 MB", type: "application/pdf" },
      { name: "Teaching_Certificate.pdf", size: "2.5 MB", type: "application/pdf" },
      { name: "Masters_Degree.pdf", size: "3.1 MB", type: "application/pdf" },
    ],
    qualifications: "Ph.D. in Computer Science from MIT. 5 years of teaching experience at university level.",
    experience: "Taught programming courses at MIT for 3 years. Worked as a senior developer at Google for 2 years.",
    specializations: ["Web Development", "Machine Learning", "Data Structures"],
    phone: "+1 (555) 123-4567",
    address: "123 Tech Lane, Cambridge, MA 02142",
  },
  {
    id: "TR-002",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    submittedAt: "2023-04-14T14:22:00Z",
    status: "pending",
    documents: [
      { name: "ID_Card.pdf", size: "0.9 MB", type: "application/pdf" },
      { name: "Teaching_License.pdf", size: "1.8 MB", type: "application/pdf" },
      { name: "Bachelor_Degree.pdf", size: "2.3 MB", type: "application/pdf" },
    ],
    qualifications: "Bachelor's in Education from Stanford. Certified teacher with specialization in mathematics.",
    experience: "5 years teaching mathematics at high school level. 2 years of online tutoring experience.",
    specializations: ["Mathematics", "Algebra", "Calculus"],
    phone: "+1 (555) 987-6543",
    address: "456 Education Ave, Palo Alto, CA 94301",
  },
  {
    id: "TR-003",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    submittedAt: "2023-04-13T09:15:00Z",
    status: "approved",
    documents: [
      { name: "ID_Card.pdf", size: "1.1 MB", type: "application/pdf" },
      { name: "Teaching_Certificate.pdf", size: "2.2 MB", type: "application/pdf" },
      { name: "PhD_Certificate.pdf", size: "3.5 MB", type: "application/pdf" },
    ],
    qualifications: "Ph.D. in Physics from Caltech. Published researcher in quantum mechanics.",
    experience: "10 years teaching physics at university level. Created online courses with over 50,000 students.",
    specializations: ["Physics", "Quantum Mechanics", "Astrophysics"],
    phone: "+1 (555) 456-7890",
    address: "789 Science Blvd, Pasadena, CA 91125",
  },
  {
    id: "TR-004",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    submittedAt: "2023-04-12T16:45:00Z",
    status: "rejected",
    documents: [
      { name: "ID_Card.pdf", size: "1.0 MB", type: "application/pdf" },
      { name: "Resume.pdf", size: "1.5 MB", type: "application/pdf" },
    ],
    qualifications: "Self-taught web developer with 3 years of experience.",
    experience: "Freelance web developer. Created personal blog with tutorials.",
    specializations: ["Web Development", "JavaScript"],
    phone: "+1 (555) 234-5678",
    address: "321 Coding St, San Francisco, CA 94107",
    rejectionReason: "Insufficient teaching experience and qualifications.",
  },
  {
    id: "TR-005",
    name: "David Wilson",
    email: "david.wilson@example.com",
    submittedAt: "2023-04-11T11:30:00Z",
    status: "pending",
    documents: [
      { name: "ID_Card.pdf", size: "1.2 MB", type: "application/pdf" },
      { name: "Teaching_Certificate.pdf", size: "2.1 MB", type: "application/pdf" },
      { name: "Masters_Degree.pdf", size: "2.8 MB", type: "application/pdf" },
    ],
    qualifications: "Master's in Music from Juilliard. Professional pianist with international performances.",
    experience: "15 years teaching piano to students of all ages. Created online piano course with 10,000+ students.",
    specializations: ["Music", "Piano", "Music Theory"],
    phone: "+1 (555) 876-5432",
    address: "654 Harmony Lane, New York, NY 10023",
  },
]

const reviewSchema = z
  .object({
    status: z.enum(["approved", "rejected"]),
    comments: z.string().optional(),
    rejectionReason: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.status === "rejected" && (!data.rejectionReason || data.rejectionReason.trim() === "")) {
        return false
      }
      return true
    },
    {
      message: "Rejection reason is required when rejecting a request",
      path: ["rejectionReason"],
    },
  )

export default function TutorRequestsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>(["pending", "approved", "rejected"])
  const [selectedRequest, setSelectedRequest] = useState<(typeof tutorRequests)[0] | null>(null)
  const [viewingDocuments, setViewingDocuments] = useState(false)
  const [reviewingRequest, setReviewingRequest] = useState(false)
  const [viewingDetails, setViewingDetails] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<(typeof tutorRequests)[0]["documents"][0] | null>(null)
  const [previewingDocument, setPreviewingDocument] = useState(false)

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      status: "approved",
      comments: "",
      rejectionReason: "",
    },
  })

  const filteredRequests = tutorRequests.filter((request) => {
    const matchesSearch =
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter.includes(request.status)

    return matchesSearch && matchesStatus
  })

  const handleViewRequest = (request: (typeof tutorRequests)[0]) => {
    setSelectedRequest(request)
    setViewingDetails(true)
  }

  const handleViewDocuments = (request: (typeof tutorRequests)[0]) => {
    setSelectedRequest(request)
    setViewingDocuments(true)
  }

  const handleReviewRequest = (request: (typeof tutorRequests)[0]) => {
    setSelectedRequest(request)
    setReviewingRequest(true)
    form.reset({
      status: "approved",
      comments: "",
      rejectionReason: "",
    })
  }

  const handlePreviewDocument = (document: (typeof tutorRequests)[0]["documents"][0]) => {
    setSelectedDocument(document)
    setPreviewingDocument(true)
  }

  const onSubmitReview = (values: z.infer<typeof reviewSchema>) => {
    console.log(values)

    toast({
      title: `Request ${values.status === "approved" ? "approved" : "rejected"}`,
      description: `Tutor request ${selectedRequest?.id} has been ${values.status === "approved" ? "approved" : "rejected"}.`,
    })

    setReviewingRequest(false)
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <AdminSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">Tutor Verification Requests</h1>
              <p className="text-sm text-muted-foreground">Review and manage tutor verification requests</p>
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
                    <DropdownMenuCheckboxItem
                      checked={statusFilter.includes("pending")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStatusFilter([...statusFilter, "pending"])
                        } else {
                          setStatusFilter(statusFilter.filter((s) => s !== "pending"))
                        }
                      }}
                    >
                      Pending
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter.includes("approved")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStatusFilter([...statusFilter, "approved"])
                        } else {
                          setStatusFilter(statusFilter.filter((s) => s !== "approved"))
                        }
                      }}
                    >
                      Approved
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={statusFilter.includes("rejected")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStatusFilter([...statusFilter, "rejected"])
                        } else {
                          setStatusFilter(statusFilter.filter((s) => s !== "rejected"))
                        }
                      }}
                    >
                      Rejected
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All Requests</TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({tutorRequests.filter((r) => r.status === "pending").length})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({tutorRequests.filter((r) => r.status === "approved").length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({tutorRequests.filter((r) => r.status === "rejected").length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-4">
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
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequests.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No requests found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredRequests.map((request) => (
                            <TableRow key={request.id}>
                              <TableCell className="font-medium">{request.id}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://avatar.vercel.sh/${request.email}`} />
                                    <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{request.name}</div>
                                    <div className="text-xs text-muted-foreground">{request.email}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{new Date(request.submittedAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    request.status === "approved"
                                      ? "default"
                                      : request.status === "rejected"
                                        ? "destructive"
                                        : "outline"
                                  }
                                >
                                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>{request.documents.length} files</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => handleViewRequest(request)}>
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">View</span>
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleViewDocuments(request)}>
                                    <FileText className="h-4 w-4" />
                                    <span className="sr-only">Documents</span>
                                  </Button>
                                  {request.status === "pending" && (
                                    <Button variant="ghost" size="icon" onClick={() => handleReviewRequest(request)}>
                                      <Check className="h-4 w-4" />
                                      <span className="sr-only">Review</span>
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="pending" className="space-y-4">
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Tutor</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Documents</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequests.filter((r) => r.status === "pending").length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No pending requests found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredRequests
                            .filter((r) => r.status === "pending")
                            .map((request) => (
                              <TableRow key={request.id}>
                                <TableCell className="font-medium">{request.id}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={`https://avatar.vercel.sh/${request.email}`} />
                                      <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{request.name}</div>
                                      <div className="text-xs text-muted-foreground">{request.email}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{new Date(request.submittedAt).toLocaleDateString()}</TableCell>
                                <TableCell>{request.documents.length} files</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleViewRequest(request)}>
                                      <Eye className="h-4 w-4" />
                                      <span className="sr-only">View</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleViewDocuments(request)}>
                                      <FileText className="h-4 w-4" />
                                      <span className="sr-only">Documents</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleReviewRequest(request)}>
                                      <Check className="h-4 w-4" />
                                      <span className="sr-only">Review</span>
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="approved" className="space-y-4">
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Tutor</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Approved</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequests.filter((r) => r.status === "approved").length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No approved requests found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredRequests
                            .filter((r) => r.status === "approved")
                            .map((request) => (
                              <TableRow key={request.id}>
                                <TableCell className="font-medium">{request.id}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={`https://avatar.vercel.sh/${request.email}`} />
                                      <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{request.name}</div>
                                      <div className="text-xs text-muted-foreground">{request.email}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{new Date(request.submittedAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  {new Date(
                                    new Date(request.submittedAt).getTime() + 2 * 24 * 60 * 60 * 1000,
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleViewRequest(request)}>
                                      <Eye className="h-4 w-4" />
                                      <span className="sr-only">View</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleViewDocuments(request)}>
                                      <FileText className="h-4 w-4" />
                                      <span className="sr-only">Documents</span>
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="rejected" className="space-y-4">
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Tutor</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Rejected</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequests.filter((r) => r.status === "rejected").length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No rejected requests found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredRequests
                            .filter((r) => r.status === "rejected")
                            .map((request) => (
                              <TableRow key={request.id}>
                                <TableCell className="font-medium">{request.id}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={`https://avatar.vercel.sh/${request.email}`} />
                                      <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{request.name}</div>
                                      <div className="text-xs text-muted-foreground">{request.email}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{new Date(request.submittedAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  {new Date(
                                    new Date(request.submittedAt).getTime() + 1 * 24 * 60 * 60 * 1000,
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate">{request.rejectionReason}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleViewRequest(request)}>
                                      <Eye className="h-4 w-4" />
                                      <span className="sr-only">View</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleViewDocuments(request)}>
                                      <FileText className="h-4 w-4" />
                                      <span className="sr-only">Documents</span>
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* View Tutor Details Dialog */}
      <Dialog open={viewingDetails} onOpenChange={setViewingDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tutor Details</DialogTitle>
            <DialogDescription>Review the tutor&apos;s personal information and qualifications</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`https://avatar.vercel.sh/${selectedRequest.email}`} />
                  <AvatarFallback>{selectedRequest.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold">{selectedRequest.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{selectedRequest.email}</span>
                    <span>•</span>
                    <span>{selectedRequest.phone}</span>
                  </div>
                  <Badge
                    variant={
                      selectedRequest.status === "approved"
                        ? "default"
                        : selectedRequest.status === "rejected"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Personal Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Address:</span>
                      <p className="text-sm">{selectedRequest.address}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Request ID:</span>
                      <p className="text-sm">{selectedRequest.id}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Submitted:</span>
                      <p className="text-sm">{new Date(selectedRequest.submittedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.specializations?.map((specialization) => (
                      <Badge key={specialization} variant="secondary">
                        {specialization}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-2">Qualifications</h4>
                <p className="text-sm">{selectedRequest.qualifications}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Experience</h4>
                <p className="text-sm">{selectedRequest.experience}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Documents</h4>
                <div className="space-y-2">
                  {selectedRequest.documents.map((document) => (
                    <div key={document.name} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{document.name}</span>
                        <span className="text-xs text-muted-foreground">({document.size})</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handlePreviewDocument(document)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedRequest.status === "rejected" && (
                <div>
                  <h4 className="text-sm font-medium mb-2 text-destructive">Rejection Reason</h4>
                  <p className="text-sm border border-destructive/20 bg-destructive/10 p-3 rounded-md">
                    {selectedRequest.rejectionReason}
                  </p>
                </div>
              )}

              <DialogFooter>
                {selectedRequest.status === "pending" && (
                  <Button
                    onClick={() => {
                      setViewingDetails(false)
                      handleReviewRequest(selectedRequest)
                    }}
                  >
                    Review Request
                  </Button>
                )}
                <Button variant="outline" onClick={() => setViewingDetails(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Documents Dialog */}
      <Dialog open={viewingDocuments} onOpenChange={setViewingDocuments}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submitted Documents</DialogTitle>
            <DialogDescription>Review the documents submitted by {selectedRequest?.name}</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://avatar.vercel.sh/${selectedRequest.email}`} />
                    <AvatarFallback>{selectedRequest.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedRequest.name}</div>
                    <div className="text-xs text-muted-foreground">{selectedRequest.email}</div>
                  </div>
                </div>
                <Badge
                  variant={
                    selectedRequest.status === "approved"
                      ? "default"
                      : selectedRequest.status === "rejected"
                        ? "destructive"
                        : "outline"
                  }
                >
                  {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-4">
                {selectedRequest.documents.map((document, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {document.name}
                      </CardTitle>
                      <CardDescription>{document.size}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="h-40 bg-muted rounded-md flex items-center justify-center">
                        <FileText className="h-12 w-12 text-muted-foreground opacity-50" />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => handlePreviewDocument(document)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              <DialogFooter>
                {selectedRequest.status === "pending" && (
                  <Button
                    onClick={() => {
                      setViewingDocuments(false)
                      handleReviewRequest(selectedRequest)
                    }}
                  >
                    Review Request
                  </Button>
                )}
                <Button variant="outline" onClick={() => setViewingDocuments(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={previewingDocument} onOpenChange={setPreviewingDocument}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
            <DialogDescription>
              {selectedDocument?.name} ({selectedDocument?.size})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="h-[60vh] bg-muted rounded-md flex flex-col items-center justify-center">
              <FileText className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground">Preview not available</p>
              <p className="text-xs text-muted-foreground">Download the document to view it</p>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" />
                Open in New Tab
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Request Dialog */}
      <Dialog open={reviewingRequest} onOpenChange={setReviewingRequest}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Tutor Request</DialogTitle>
            <DialogDescription>Review and make a decision on {selectedRequest?.name}&apos;s request</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`https://avatar.vercel.sh/${selectedRequest.email}`} />
                    <AvatarFallback>{selectedRequest.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedRequest.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedRequest.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Qualifications</Label>
                    <div className="p-3 bg-muted rounded-md text-sm">{selectedRequest.qualifications}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Experience</Label>
                    <div className="p-3 bg-muted rounded-md text-sm">{selectedRequest.experience}</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Documents</Label>
                    <div className="p-3 bg-muted rounded-md text-sm">
                      <ul className="list-disc list-inside space-y-1">
                        {selectedRequest.documents.map((doc, index) => (
                          <li key={index}>
                            {doc.name} ({doc.size})
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator />

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
                            <FormLabel className="font-normal">Approve - Grant tutor status</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="rejected" />
                            </FormControl>
                            <FormLabel className="font-normal">Reject - Deny tutor status</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comments (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any comments about this decision..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>These comments are for internal use only.</FormDescription>
                      <FormMessage />
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
                            placeholder="Explain why this request is being rejected..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>This reason will be shared with the tutor.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setReviewingRequest(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {form.watch("status") === "approved" ? "Approve Request" : "Reject Request"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
