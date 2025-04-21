"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { FileText, Upload, X } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { TutorSidebar } from "@/components/tutor-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]

const documentVerificationSchema = z.object({
  qualifications: z.string().min(1, {
    message: "Please enter your qualifications",
  }),
  specialization: z.string().min(1, {
    message: "Please enter your specialization",
  }),
  experience: z.string().min(1, {
    message: "Please enter your teaching experience",
  }),
  documentType: z.string({
    required_error: "Please select a document type",
  }),
  documentDescription: z.string().min(1, {
    message: "Please provide a description for your document",
  }),
})

type DocumentVerificationFormValues = z.infer<typeof documentVerificationSchema>

interface UploadedFile {
  file: File
  id: string
  name: string
  type: string
  size: number
  preview: string | null
}

export default function DocumentVerificationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploadError, setUploadError] = useState("")

  const form = useForm<DocumentVerificationFormValues>({
    resolver: zodResolver(documentVerificationSchema),
    defaultValues: {
      qualifications: "",
      specialization: "",
      experience: "",
      documentType: "",
      documentDescription: "",
    },
  })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    const files = Array.from(e.target.files)
    setUploadError("")

    const invalidFiles = files.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`File ${file.name} is too large. Maximum size is 5MB.`)
        return true
      }
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        setUploadError(`File ${file.name} has an invalid type. Accepted types are PDF, JPEG, and PNG.`)
        return true
      }
      return false
    })

    if (invalidFiles.length === 0) {
      const newFiles = files.map((file) => ({
        file,
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      }))

      setUploadedFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id))
  }

  async function onSubmit(values: DocumentVerificationFormValues) {
    if (uploadedFiles.length === 0) {
      setUploadError("Please upload at least one document")
      return
    }

    setIsSubmitting(true)

    try {
      // This would be replaced with actual API call
      console.log(values)
      console.log(uploadedFiles)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Documents submitted successfully",
        description: "Your verification documents have been submitted for review.",
      })

      // Redirect to pending page
      router.push("/tutor/verification/pending")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit documents. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <TutorSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">Tutor Verification</h1>
              <p className="text-sm text-muted-foreground">Submit your documents for verification</p>
            </div>
          </div>
          <div className="flex-1 space-y-4 p-8 pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Information</CardTitle>
                    <CardDescription>
                      Provide information about your qualifications and teaching experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="qualifications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Educational Qualifications</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g. Master's in Computer Science, Stanford University"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            List your degrees, certifications, and relevant educational qualifications
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="specialization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Areas of Specialization</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Web Development, Data Science, Digital Marketing" {...field} />
                          </FormControl>
                          <FormDescription>Enter the subjects or topics you specialize in teaching</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teaching Experience</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g. 5 years teaching web development at XYZ University"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Describe your teaching experience, including years of experience and institutions
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Document Upload</CardTitle>
                    <CardDescription>Upload documents to verify your identity and qualifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="documentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Document Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select document type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="degree">Degree Certificate</SelectItem>
                                <SelectItem value="id">Government ID</SelectItem>
                                <SelectItem value="teaching_cert">Teaching Certificate</SelectItem>
                                <SelectItem value="resume">Resume/CV</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>Select the type of document you are uploading</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="documentDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Document Description</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Master's Degree in Computer Science" {...field} />
                            </FormControl>
                            <FormDescription>Provide a brief description of the document</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="dropzone-file"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-1 text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">PDF, PNG, JPG (MAX. 5MB)</p>
                          </div>
                          <input
                            id="dropzone-file"
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            multiple
                            onChange={handleFileUpload}
                          />
                        </label>
                      </div>
                      {uploadError && <p className="mt-2 text-sm text-destructive">{uploadError}</p>}
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium mb-2">Uploaded Documents</h3>
                        <div className="space-y-2">
                          {uploadedFiles.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => removeFile(file.id)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit for Verification"}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </Form>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
