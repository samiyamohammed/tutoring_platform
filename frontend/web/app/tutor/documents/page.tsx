"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { FileText, Upload, X, Plus, ChevronLeft, Eye, Download, Clock, Edit, Check, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { TutorSidebar } from "@/components/tutor-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]

const documentVerificationSchema = z.object({
  qualification: z.string().min(1, {
    message: "Please enter your qualifications",
  }),
  experience: z.string().min(1, {
    message: "Please enter your teaching experience",
  }).refine(val => !isNaN(Number(val)), {
    message: "Experience must be a number",
  }),
  subjects: z.string().min(1, {
    message: "Please enter subjects you teach",
  }),
  verification_status: z.enum(["initial", "requested", "approved", "rejected"]),
  documents: z.array(z.object({
    type: z.string().min(1, "Document type is required"),
    description: z.string().optional(),
    files: z.array(z.any()).min(1, "At least one file is required"),
  })).min(1, "At least one document is required"),
})

type DocumentVerificationFormValues = z.infer<typeof documentVerificationSchema>

interface UploadedFile {
  file: File | string
  id: string
  name: string
  type: string
  size: number
  url?: string
}

interface VerificationDocument {
  _id: string
  name: string
  url: string
  type?: string 
  size?: number
}

interface TutorData {
  _id: string
  qualification: string
  experience: number
  subjects: string[]
  verification_status: "initial" | "requested" | "approved" | "rejected"
  verification_documents?: VerificationDocument[]
  ratings: any[]
  createdAt: string
  updatedAt: string
  __v: number
}

export default function DocumentVerificationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDoc, setIsLoadingDoc] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [tutorData, setTutorData] = useState<TutorData | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<VerificationDocument | null>(null)
  const [editMode, setEditMode] = useState(false)
  const encodedUrl = selectedDoc?.url ? encodeURIComponent(selectedDoc.url) : "";
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const form = useForm<DocumentVerificationFormValues>({
    resolver: zodResolver(documentVerificationSchema),
    defaultValues: {
      qualification: "",
      experience: "",
      subjects: "",
      verification_status: "initial",
      documents: [{
        type: "",
        description: "",
        files: []
      }]
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "documents",
  })

  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("http://localhost:5000/api/users/profile", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          cache: "no-store"
        })

        if (!res.ok) throw new Error("Failed to fetch tutor data")

        const data: TutorData = await res.json()
        setTutorData(data)

        form.reset({
          qualification: data.qualification || "",
          experience: data.experience?.toString() || "",
          subjects: data.subjects?.join(", ") || "",
          verification_status: data.verification_status || "initial",
          documents: data.verification_documents?.length
            ? [{
              type: "resume",
              description: "",
              files: data.verification_documents.map(file => ({
                file: file.url,
                id: file._id,
                name: file.name || "Document",
                type: file.type || "application/octet-stream",
                size: file.size || 0,
                url: file.url
              }))
            }]
            : [{
              type: "",
              description: "",
              files: []
            }]
        })
      } catch (error) {
        console.error(error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load verification data.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTutorData()
  }, [form, toast])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, documentIndex: number) => {
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
      const currentFiles = form.getValues(`documents.${documentIndex}.files`) || []
      const newFiles = files.map((file) => ({
        file,
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
      }))

      form.setValue(`documents.${documentIndex}.files`, [...currentFiles, ...newFiles])
    }
  }

  const handlePreviewDocument = async (doc: VerificationDocument) => {
    try {
      setIsLoadingDoc(true);
      setSelectedDoc(doc);

      // Always use absolute URL from backend
      const fullUrl = doc.url.startsWith("http")
        ? doc.url
        : `http://localhost:5000${doc.url}`;

      // Determine content type from response header instead of extension
      const headResponse = await fetch(fullUrl, {
        method: "HEAD",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const contentType =
        headResponse.headers.get("content-type") || "application/octet-stream";

      setSelectedDoc({
        ...doc,
        url: fullUrl,
        type: contentType,
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

  const removeFile = (documentIndex: number, fileId: string) => {
    const currentFiles = form.getValues(`documents.${documentIndex}.files`) || []
    form.setValue(
      `documents.${documentIndex}.files`,
      currentFiles.filter((file) => file.id !== fileId)
    )
  }

  async function onSubmit(values: DocumentVerificationFormValues) {
    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()

      formData.append('qualification', values.qualification)
      formData.append('experience', values.experience)
      formData.append('subjects', values.subjects)
      formData.append('verification_status', "requested")

      formData.append('documents', JSON.stringify(values.documents.map((doc) => ({
        type: doc.type,
        description: doc.description || ""
      }))))

      values.documents.forEach((doc, docIndex) => {
        doc.files.forEach((fileObj) => {
          if (fileObj.file instanceof File) {
            formData.append('files', fileObj.file)
            formData.append('fileDocumentIndexes', docIndex.toString())
            const documentName = doc.type === 'other' && doc.description
              ? doc.description
              : doc.type
            formData.append('fileDocumentNames', documentName)
          }
        })
      })

      const token = localStorage.getItem("token")
      const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null

      if (!user || !user.id) {
        throw new Error("User information is missing or invalid.")
      }

      const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Submission failed')
      }

      const updatedData = await response.json()
      setTutorData(updatedData)
      setEditMode(false)

      toast({
        title: "Documents submitted successfully",
        description: "Your verification documents have been submitted for review.",
      })
    } catch (error) {
      console.error('Submission error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit documents. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
      setUploadProgress(null)
    }
  }

  const toggleEditMode = () => {
    setEditMode(!editMode)
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <TutorSidebar />
          <main className="flex flex-col">
            <div className="flex items-center justify-center h-full">
              <div className="space-y-4 w-full max-w-4xl p-6">
                <Skeleton className="h-10 w-[300px]" />
                <Skeleton className="h-6 w-[400px]" />
                <div className="space-y-8 pt-6">
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <TutorSidebar />
        <main className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center space-x-4">
              {editMode ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleEditMode}
                  className="rounded-full"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className="rounded-full"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              <div>
                <h1 className="text-xl font-semibold">Tutor Verification</h1>
                <p className="text-sm text-muted-foreground">
                  {editMode ? "Edit your verification details" : "View your verification details"}
                </p>
              </div>
            </div>
            {!editMode && tutorData?.verification_status !== "approved" && (
              <Button
                variant="outline"
                onClick={toggleEditMode}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>

          <div className="flex-1 p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              {editMode ? (
                /* EDIT MODE UI */
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Professional Information Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Professional Information</CardTitle>
                        <CardDescription>
                          Tell us about your teaching background and expertise
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="qualification"
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="subjects"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subjects You Teach</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. Web Development, Data Science, Digital Marketing"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="experience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Years of Teaching Experience</FormLabel>
                              <FormControl>
                                <div className="relative w-32">
                                  <Input
                                    type="number"
                                    placeholder="e.g. 5"
                                    className="pr-8"
                                    {...field}
                                  />
                                  <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">
                                    yrs
                                  </span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    {/* Documents Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Verification Documents</CardTitle>
                        <CardDescription>
                          Upload documents that verify your qualifications and identity
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {fields.map((field, index) => (
                          <div key={field.id} className="space-y-4 border p-4 rounded-lg bg-muted/10">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-primary" />
                                Document {index + 1}
                              </h3>
                              {index > 0 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => remove(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`documents.${index}.type`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Document Type</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select document type" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="degree">Degree Certificate</SelectItem>
                                        <SelectItem value="certification">Professional Certification</SelectItem>
                                        <SelectItem value="resume">Resume/CV</SelectItem>
                                        <SelectItem value="id">Government ID</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {form.watch(`documents.${index}.type`) === 'other' && (
                                <FormField
                                  control={form.control}
                                  name={`documents.${index}.description`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Document Description</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Describe this document" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor={`dropzone-file-${index}`}
                                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted/30 transition-colors"
                              >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                                  <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                                  <p className="mb-2 text-sm text-muted-foreground">
                                    <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    PDF, PNG, JPG (MAX. 5MB each)
                                  </p>
                                </div>
                                <input
                                  id={`dropzone-file-${index}`}
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  multiple
                                  onChange={(e) => handleFileUpload(e, index)}
                                />
                              </label>
                              {uploadError && (
                                <p className="mt-2 text-sm text-destructive flex items-center">
                                  <X className="h-4 w-4 mr-1" /> {uploadError}
                                </p>
                              )}
                            </div>

                            {form.watch(`documents.${index}.files`).map((file: UploadedFile) => (
                              <div
                                key={file.id}
                                className="flex items-center justify-between p-3 border rounded-lg bg-background hover:bg-muted/20 transition-colors"
                              >
                                <div className="flex items-center space-x-3">
                                  <FileText className="h-5 w-5 text-primary" />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {(typeof file.size === 'number' ? (file.size / 1024 / 1024).toFixed(2) : 'N/A')} MB •
                                      {file.type
                                        ? (file.type.split('/')[1]?.toUpperCase() || 'FILE')
                                        : 'FILE'}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeFile(index, file.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-dashed"
                          onClick={() => append({ type: "", description: "", files: [] })}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Another Document
                        </Button>
                      </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4 pt-6">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={toggleEditMode}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </span>
                        ) : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                /* READ-ONLY MODE UI */
                <div className="space-y-6">
                  {/* Professional Information Card */}
                  <Card>

                    {tutorData?.verification_status === "requested" && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardHeader className="flex flex-row items-center space-x-4 space-y-0">
                          <div className="bg-blue-100 p-3 rounded-full">
                            <Clock className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-blue-800">Verification Pending</CardTitle>
                            <CardDescription className="text-blue-700">
                              Your documents are under review. This typically takes 1-3 business days.
                            </CardDescription>
                          </div>
                        </CardHeader>
                      </Card>
                    )}

                    <CardHeader>
                      <CardTitle className="text-lg">Professional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Qualifications</p>
                        <p className="text-sm">{tutorData?.qualification || "Not provided"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Subjects</p>
                        <div className="flex flex-wrap gap-1">
                          {tutorData?.subjects?.map((subject, index) => (
                            <Badge key={index} variant="outline">
                              {subject}
                            </Badge>
                          )) || "Not provided"}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Experience</p>
                        <p className="text-sm">{tutorData?.experience ? `${tutorData.experience} years` : "Not provided"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Verification Documents Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Verification Documents</CardTitle>
                      <CardDescription>
                        Status: <Badge variant={
                          tutorData?.verification_status === "approved" ? "default" :
                            tutorData?.verification_status === "rejected" ? "destructive" :
                              "secondary"
                        }>
                          {tutorData?.verification_status?.toUpperCase() || "Not submitted"}
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {tutorData?.verification_documents?.length ? (
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <h3 className="font-medium text-sm">Resume</h3>
                            {/* In the read-only mode document display section */}
                            <div className="space-y-2">
                              {tutorData.verification_documents.map((file, fileIndex) => (
                                <div
                                  key={fileIndex}
                                  className="flex items-center justify-between p-3 border rounded-lg bg-background hover:bg-muted/20 transition-colors"
                                >
                                  <div className="flex items-center space-x-3">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium truncate">{file.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {file.type
                                          ? (file.type.split('/')[1]?.toUpperCase() || 'FILE')
                                          : 'FILE'}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-primary hover:text-primary"
                                    onClick={() => handlePreviewDocument(file)}
                                    disabled={isLoadingDoc}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No documents submitted yet</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Status Card */}

                </div>
              )}

              {/* Document Preview Dialog */}
              {/* Document Preview Dialog */}
              <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle>{selectedDoc?.name}</DialogTitle>
                    <DialogDescription>
                      {selectedDoc?.type?.includes('pdf') ? 'PDF Preview' : 'Document Preview'}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex-1 min-h-0 overflow-auto">
                    {isLoadingDoc ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center space-y-2">
                          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p>Loading document...</p>
                        </div>
                      </div>
                    ) : selectedDoc?.type?.includes('pdf') || selectedDoc?.url?.endsWith('.pdf') ? (
                      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                        <Viewer
                          fileUrl={selectedDoc.url}
                          httpHeaders={{
                            Authorization: `Bearer ${localStorage.getItem("token")}`
                          }}
                          plugins={[defaultLayoutPluginInstance]}
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
                                  <a href={selectedDoc.url} target="_blank" rel="noopener noreferrer">
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
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}