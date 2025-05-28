"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Award, Download, ExternalLink, Search } from "lucide-react";

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
import { toast } from "sonner";
import { StudentSidebar } from "@/components/student-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Enrollment {
  _id: string;
  course: {
    _id: string;
    title: string;
  };
  currentStatus: string;
  certification?: {
    eligible: boolean;
    issued: boolean;
    issuedAt: string;
    certificateId: string;
    downloadUrl: string;
    expirationDate: string;
  };
  progress: {
    completionPercentage: number;
  };
  tutor: {
    name: string;
  };
  actualCompletionDate?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function StudentCertificatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const response = await fetch("${baseUrl}/api/enrollment/mycourses", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch certificates");
        }

        const data = await response.json();
        setEnrollments(data);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load certificates"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [toast]);

  const issuedCertificates = enrollments.filter((e) => e.certification?.issued);
  const filteredCertificates = issuedCertificates.filter((e) =>
    e.course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (url: string) => {
    window.open(`${baseUrl}${url}`, "_blank");
    toast.success("Your certificate has been downloaded successfully.");
  };

  const handleShare = (certificateId: string) => {
    navigator.clipboard.writeText(
      `https://educonnect.example/certificates/${certificateId}`
    );
    toast.message("Share this link to showcase your certificate.");
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <StudentSidebar />
          <main className="flex flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h1 className="text-lg font-semibold">My Certificates</h1>
                <p className="text-sm text-muted-foreground">
                  View and manage your course completion certificates
                </p>
              </div>
            </div>
            <div className="flex-1 p-8 pt-6">
              <Skeleton className="h-10 w-80 mb-4" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-96 w-full" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <StudentSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-xl font-semibold">My Certificates</h1>
              <p className="text-sm text-muted-foreground">
                View and manage your issued course completion certificates.
              </p>
            </div>
          </div>
          <div className="flex-1 p-8 pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
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

            {filteredCertificates.length === 0 ? (
              <EmptyCertificates searchQuery={searchQuery} />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCertificates.map((enrollment) => (
                  <IssuedCertificateCard
                    key={enrollment._id}
                    enrollment={enrollment}
                    onDownload={handleDownload}
                    onShare={handleShare}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

function IssuedCertificateCard({
  enrollment,
  onDownload,
  onShare,
}: {
  enrollment: Enrollment;
  onDownload: (url: string) => void;
  onShare: (id: string) => void;
}) {
  if (!enrollment.certification) return null;

  const pdfUrl = `${baseUrl}${enrollment.certification.downloadUrl}`;
  const shareUrl = `/certificates/${enrollment.certification.certificateId}`;

  return (
    <Link
      href={shareUrl}
      className="hover:shadow-lg transition-shadow rounded-md"
    >
      <Card className="h-full flex flex-col justify-between hover:border-primary">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Issued
            </Badge>
            <div className="text-sm text-muted-foreground">
              {new Date(enrollment.certification.issuedAt).toLocaleDateString()}
            </div>
          </div>
          <CardTitle className="mt-2 text-lg">
            {enrollment.course.title}
          </CardTitle>
          <CardDescription>
            Tutor: {enrollment.tutor?.name || "Unknown"}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1">
          <div className="relative w-full overflow-hidden rounded-md border bg-muted">
            <div className="relative pb-[75%]">
              <embed
                src={pdfUrl}
                type="application/pdf"
                className="absolute top-0 left-0 h-full w-full"
              />
            </div>
          </div>
          <div className="mt-2 text-center text-sm font-medium">
            Completed:{" "}
            {new Date(
              enrollment.actualCompletionDate || ""
            ).toLocaleDateString()}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onDownload(enrollment.certification!.downloadUrl);
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onShare(enrollment.certification!.certificateId);
            }}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Share
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

function EmptyCertificates({ searchQuery }: { searchQuery: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No certificates found</CardTitle>
        <CardDescription>
          {searchQuery
            ? "No certificates match your search criteria."
            : "You haven't received any certificates yet."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <Award className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-center text-muted-foreground">
          {searchQuery
            ? "Try adjusting your search or clear the search field."
            : "Complete courses to earn certificates that showcase your skills."}
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
  );
}
