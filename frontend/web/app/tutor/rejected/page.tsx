"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TutorRejectedSidebar } from "@/components/TutorRejectedSidebar";
import { AlertCircle, Mail, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function TutorRejectedPage() {
  const [rejectionData, setRejectionData] = useState<{
    reason: string;
    details: string;
    date: string;
    adminComments?: string;
    canAppeal: boolean;
  } | null>(null);

  useEffect(() => {
    // Mock rejection data
    const mockRejectionData = {
      reason: "Document Verification Failed",
      details:
        "The educational certificates you provided could not be verified with the issuing institutions.",
      date: new Date().toLocaleDateString(),
      adminComments:
        "The PhD certificate from University of XYZ appears to be altered. We couldn't verify its authenticity with the university records.",
      canAppeal: true,
    };
    setRejectionData(mockRejectionData);
  }, []);

  const handleAppeal = () => {
    alert(
      "Appeal submitted! Our team will review your case within 3-5 business days."
    );
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-black text-gray-100">
        <TutorRejectedSidebar />

        <main className="flex-1 p-8 overflow-y-auto bg-black">
          <div className="max-w-4xl mx-auto">
            {/* Rejection Header */}
            <div className="flex items-center gap-4 mb-8">
              <AlertTriangle className="h-10 w-10 text-red-500" />
              <div>
                <h1 className="text-2xl font-bold text-red-500">
                  Application Rejected
                </h1>
                <p className="text-gray-400">
                  Your tutor application has not been approved
                </p>
              </div>
            </div>

            {/* Rejection Details Card */}
            {rejectionData ? (
              <Card className="bg-black">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                    <h2 className="text-lg font-semibold">Rejection Details</h2>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Reason</p>
                      <p className="font-medium">{rejectionData.reason}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{rejectionData.date}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Details</p>
                    <p className="font-medium">{rejectionData.details}</p>
                  </div>

                  {rejectionData.adminComments && (
                    <div className="p-4 bg-black rounded-md">
                      <p className="text-sm text-gray-500">Admin Comments</p>
                      <p className="font-medium">
                        {rejectionData.adminComments}Need Help
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-800">
                    <h3 className="font-medium mb-2">Next Steps</h3>
                    <ul className="space-y-2 list-disc pl-5 text-sm text-gray-300">
                      <li>Review the rejection reason carefully</li>
                      <li>Update your profile if you can address the issues</li>
                      {rejectionData.canAppeal && (
                        <li>
                          You may submit an appeal with additional documentation
                        </li>
                      )}
                      <li>Contact support if you believe this is an error</li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-4 pt-0">
                  {rejectionData.canAppeal && (
                    <Button
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-gray-800"
                      onClick={handleAppeal}
                    >
                      Submit Appeal
                    </Button>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="h-4 w-4" />
                    <span>Questions? Email us at support@educonnect.com</span>
                  </div>
                </CardFooter>
              </Card>
            ) : (
              <div className="text-gray-400">Loading rejection details...</div>
            )}

            {/* Document Re-upload Section */}
            <Card className="mt-6 bg-black">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-blue-500" />
                  <h2 className="text-lg font-semibold">
                    Update Your Documents
                  </h2>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-300">
                  You may upload corrected or additional documents to address
                  the rejection reasons.
                </p>
                <div className="space-y-4">
                  <div className="p-4 border bg-black rounded-md bg-black">
                    <h3 className="font-medium mb-2">
                      PhD Certificate (Required)
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      Upload a clear scan of your original PhD certificate
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-500 text-blue-500 hover:bg-gray-800"
                      >
                        Upload New Document
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-500 hover:bg-gray-800"
                      >
                        View Current
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 border border-gray-800 rounded-md bg-black">
                    <h3 className="font-medium mb-2">
                      Government ID (Required)
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      Upload a clear scan of your passport or national ID
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-500 text-blue-500 hover:bg-gray-800"
                      >
                        Upload New Document
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-500 hover:bg-gray-800"
                      >
                        View Current
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Information */}
            <div className="mt-8 p-6 bg-black rounded-lg border border-gray-800">
              <h3 className="font-medium text-blue-500 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-300 mb-4">
                Our support team is available to help you with the appeal
                process or document requirements.
              </p>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-500 text-blue-500 hover:bg-gray-800"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-500 hover:bg-gray-800"
                >
                  View Help Center
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
