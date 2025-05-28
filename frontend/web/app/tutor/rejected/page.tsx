"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TutorRejectedSidebar } from "@/components/TutorRejectedSidebar";

export default function TutorRejectedPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRejectionData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(
          `http://localhost:5000/api/users/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch rejection data");

        const data = await response.json();
        setRejectionReason(
          data.verification_rejection_reason || "Your application was rejected"
        );
      } catch (error) {
        console.error("Error:", error);
        setRejectionReason("Could not load rejection details");
      } finally {
        setLoading(false);
      }
    };

    fetchRejectionData();
  }, []);

  const handleReapply = () => {
    router.push("/tutor/pendingandinitial?reapply=true");
    toast({
      title: "Application Submitted",
      description: "Your new application has been received for review.",
    });
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex h-screen">
          <TutorRejectedSidebar />
          <div className="flex-1 flex items-center justify-center">
            <p>Loading rejection details...</p>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <TutorRejectedSidebar />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <AlertTriangle className="h-10 w-10 text-red-500" />
              <div>
                <h1 className="text-2xl font-bold">Application Rejected</h1>
                <p className="text-muted-foreground">
                  Your tutor application was not approved
                </p>
              </div>
            </div>

            <div className="bg-card rounded-lg border p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Rejection Reason</h2>
              <p className="text-gray-800 dark:text-gray-200">
                {rejectionReason}
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleReapply} className="px-6 py-3">
                Submit New Application
              </Button>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
