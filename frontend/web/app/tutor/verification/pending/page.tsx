"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Clock, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

interface VerificationDocument {
  name: string
  url: string  // Changed from 'url' to 'id' since the backend uses file ID
}

interface TutorData {
  _id: string // Add the user ID property
  verification_status: "pending" | "requested" | "approved" | "rejected"
  verification_documents: VerificationDocument[]
}

export default function TutorVerificationPendingPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [tutorData, setTutorData] = useState<TutorData | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<VerificationDocument | null>(null)
  const [isLoadingDoc, setIsLoadingDoc] = useState(false)

  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        const token = localStorage.getItem("token"); // Replace "token" with the actual key used to store the token

        const res = await fetch("http://localhost:5000/api/users/profile", {
          method: "GET", // Use the appropriate method (GET, POST, etc.)
          headers: {
            "Authorization": `Bearer ${token}`, // Include the token in the Authorization header
          },
          cache: "no-store"
        });
        if (!res.ok) throw new Error("Failed to fetch tutor data")
        const data = await res.json()
        setTutorData(data)
      } catch (error) {
        console.error(error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load verification data.",
        })
      }
    }

    fetchTutorData()
  }, [toast])

  const handleCancelRequest = async () => {
    const token = localStorage.getItem("token"); // Retrieve the token from local storage
    const userId = tutorData?._id; // Assuming you have the user ID from the fetched data

    if (!userId) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Tutor ID is missing. Please try again.",
        });
        return;
    }

    try {
        const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
            method: "PUT", // Use PUT request to update data
            headers: {
                "Authorization": `Bearer ${token}`, // Include the token in the Authorization header
                "Content-Type": "application/json", // Specify that we're sending JSON data
            },
            body: JSON.stringify({ verification_status: "initial" }), // Send the updated status
        });

        if (!res.ok) {
            const errorData = await res.json(); // Get error details from response body
            throw new Error(errorData.message || "Network response was not ok");
        }

        toast({
            title: "Request Updated",
            description: "Your verification status has been set to requested.",
        });
        router.push("/tutor/documents");
    } catch (error) {
        console.error("Error updating verification status:", error); // Log the error for debugging
        toast({
            variant: "destructive",
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to update verification status. Please try again.",
        });
    }
}


  const handlePreviewDocument = async (doc: VerificationDocument) => {
    try {
      setIsLoadingDoc(true)
      
      // Fetch document by its ID using the API endpoint
      const res = await fetch(`http://localhost:5000/${doc.url}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`, // Use the token for authorization if needed
        },
      })

      if (!res.ok) {
        throw new Error("Failed to fetch document")
      }

      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)

      setSelectedDoc({
        name: doc.name,
        url: blobUrl,
      })
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load document preview.",
      })
    } finally {
      setIsLoadingDoc(false)
    }
  }

  if (!tutorData) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold">Verification Status</h1>
          <p className="text-sm text-muted-foreground">Your verification request is currently being reviewed</p>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Verification Pending</CardTitle>
            <CardDescription>
              Your documents have been submitted and are currently being reviewed by our team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <div className="rounded-full bg-amber-100 p-3">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium">Under Review</h3>
                <p className="text-sm text-muted-foreground">
                  This process typically takes 1-3 business days. We'll notify you once your verification is complete.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Submitted Documents</h3>
              <div className="rounded-lg border">
                {tutorData.verification_documents.map((doc, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 ${index !== tutorData.verification_documents.length - 1 ? "border-b" : ""
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreviewDocument(doc)}
                        >
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>{selectedDoc?.name}</DialogTitle>
                          <DialogDescription>Preview document</DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center justify-center border rounded-lg p-4 bg-muted/50 h-[70vh]">
                          {isLoadingDoc ? (
                            <p>Loading document...</p>
                          ) : selectedDoc ? (
                            <iframe
                              src={selectedDoc.url}
                              className="w-full h-full rounded-lg"
                              frameBorder="0"
                              title={selectedDoc.name}
                            />
                          ) : (
                            <p>No document selected.</p>
                          )}
                        </div>
                        {selectedDoc && (
                          <DialogFooter>
                            <a href={selectedDoc.url} download={selectedDoc.name} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline">
                                Download
                              </Button>
                            </a>
                          </DialogFooter>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleCancelRequest}>
              Cancel Request
            </Button>
            <Button asChild>
              <Link href="/tutor/dashboard">Go to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
