"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
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

export default function TutorVerificationPendingPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleCancelRequest = async () => {
    try {
      // This would be replaced with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Request cancelled",
        description: "Your verification request has been cancelled.",
      })

      // Redirect to verification page
      router.push("/tutor/verification")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel verification request. Please try again.",
      })
    }
  }

  // Mock document data
  const documents = [
    {
      name: "ID_Card.pdf",
      size: "1.2 MB",
      uploadedAt: "2023-04-15T10:30:00Z",
    },
    {
      name: "Teaching_Certificate.pdf",
      size: "2.5 MB",
      uploadedAt: "2023-04-15T10:32:00Z",
    },
    {
      name: "Masters_Degree.pdf",
      size: "3.1 MB",
      uploadedAt: "2023-04-15T10:35:00Z",
    },
  ]

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
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 ${
                      index !== documents.length - 1 ? "border-b" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.size} • {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{doc.name}</DialogTitle>
                          <DialogDescription>
                            Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center justify-center border rounded-lg p-8 bg-muted/50">
                          <FileText className="h-16 w-16 text-muted-foreground" />
                        </div>
                        <DialogFooter>
                          <Button variant="outline">Download</Button>
                        </DialogFooter>
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
