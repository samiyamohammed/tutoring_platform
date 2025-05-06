"use client"

import { useState } from "react"
import Link from "next/link"
import { Award, Download, ExternalLink, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { StudentSidebar } from "@/components/student-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

// Mock data for certificates
const mockCertificates = [
  {
    id: "1",
    courseTitle: "Advanced JavaScript Programming",
    issueDate: "2023-04-15",
    grade: "A",
    score: 95,
    tutor: "John Smith",
    status: "issued",
    templateId: "1",
  },
  {
    id: "2",
    courseTitle: "UI/UX Design Principles",
    issueDate: "2023-03-22",
    grade: "A-",
    score: 92,
    tutor: "Sarah Johnson",
    status: "issued",
    templateId: "2",
  },
  {
    id: "3",
    courseTitle: "Machine Learning Fundamentals",
    issueDate: null,
    grade: null,
    score: null,
    tutor: "Jennifer Lee",
    status: "pending",
    progress: 85,
    templateId: null,
  },
]

export default function StudentCertificatesPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [certificates, setCertificates] = useState(mockCertificates)

  const issuedCertificates = certificates.filter((cert) => cert.status === "issued")
  const pendingCertificates = certificates.filter((cert) => cert.status === "pending")

  const filteredIssuedCertificates = issuedCertificates.filter((cert) =>
    cert.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredPendingCertificates = pendingCertificates.filter((cert) =>
    cert.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDownload = (certificateId: string) => {
    // In a real app, this would download the certificate
    toast({
      title: "Certificate downloaded",
      description: "Your certificate has been downloaded successfully.",
    })
  }

  const handleShare = (certificateId: string) => {
    // In a real app, this would generate a shareable link
    navigator.clipboard.writeText(`https://educonnect.example/certificates/${certificateId}`)
    toast({
      title: "Link copied to clipboard",
      description: "Share this link to showcase your certificate.",
    })
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <StudentSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">My Certificates</h1>
              <p className="text-sm text-muted-foreground">View and manage your course completion certificates</p>
            </div>
          </div>
          <div className="flex-1 p-8 pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search certificates..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6">
              <Tabs defaultValue="issued" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="issued">Issued Certificates ({issuedCertificates.length})</TabsTrigger>
                  <TabsTrigger value="pending">Pending Certificates ({pendingCertificates.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="issued">
                  {filteredIssuedCertificates.length === 0 ? (
                    <EmptyCertificates type="issued" searchQuery={searchQuery} />
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filteredIssuedCertificates
                        .filter((certificate): certificate is IssuedCertificate => certificate.issueDate !== null)
                        .map((certificate) => (
                          <IssuedCertificateCard
                            key={certificate.id}
                            certificate={certificate}
                            onDownload={handleDownload}
                            onShare={handleShare}
                          />
                        ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="pending">
                  {filteredPendingCertificates.length === 0 ? (
                    <EmptyCertificates type="pending" searchQuery={searchQuery} />
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filteredPendingCertificates
                        .filter((certificate) => certificate.progress !== undefined)
                        .map((certificate) => (
                          <PendingCertificateCard key={certificate.id} certificate={certificate as PendingCertificate} />
                        ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

interface IssuedCertificate {
  id: string;
  courseTitle: string;
  issueDate: string;
  grade: string;
  score: number;
  tutor: string;
  status: string;
  templateId: string;
}

function IssuedCertificateCard({
  certificate,
  onDownload,
  onShare,
}: {
  certificate: IssuedCertificate;
  onDownload: (id: string) => void;
  onShare: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-green-50">
            Issued
          </Badge>
          <div className="text-sm text-muted-foreground">{new Date(certificate.issueDate).toLocaleDateString()}</div>
        </div>
        <CardTitle className="mt-2 text-lg">{certificate.courseTitle}</CardTitle>
        <CardDescription>Tutor: {certificate.tutor}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-4">
          <div className="relative">
            <Award className="h-20 w-20 text-primary/80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold">{certificate.grade}</span>
            </div>
          </div>
        </div>
        <div className="mt-2 text-center">
          <p className="text-sm font-medium">Score: {certificate.score}%</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={() => onDownload(certificate.id)}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <Button variant="outline" size="sm" onClick={() => onShare(certificate.id)}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Share
        </Button>
      </CardFooter>
    </Card>
  )
}

interface PendingCertificate {
  id: string;
  courseTitle: string;
  tutor: string;
  progress: number;
}

function PendingCertificateCard({ certificate }: { certificate: PendingCertificate }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-amber-50">
            In Progress
          </Badge>
        </div>
        <CardTitle className="mt-2 text-lg">{certificate.courseTitle}</CardTitle>
        <CardDescription>Tutor: {certificate.tutor}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-4">
          <div className="relative">
            <Award className="h-20 w-20 text-muted-foreground/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-muted-foreground">{certificate.progress}%</span>
            </div>
          </div>
        </div>
        <div className="mt-2">
          <div className="h-2 w-full rounded-full bg-muted">
            <div className="h-2 rounded-full bg-primary/80" style={{ width: `${certificate.progress}%` }}></div>
          </div>
          <p className="mt-2 text-center text-sm text-muted-foreground">{certificate.progress}% course completion</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/student/my-courses/${certificate.id}`}>Continue Course</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function EmptyCertificates({ type, searchQuery }: { type: string; searchQuery: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No certificates found</CardTitle>
        <CardDescription>
          {searchQuery
            ? "No certificates match your search criteria."
            : type === "issued"
              ? "You haven't received any certificates yet."
              : "You don't have any pending certificates."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <Award className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-center text-muted-foreground">
          {searchQuery
            ? "Try adjusting your search or clear the search field."
            : type === "issued"
              ? "Complete courses to earn certificates that showcase your skills."
              : "Enroll in courses and complete them to earn certificates."}
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" asChild>
          <Link href="/student/explore">
            <Search className="mr-2 h-4 w-4" />
            Explore Courses
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
