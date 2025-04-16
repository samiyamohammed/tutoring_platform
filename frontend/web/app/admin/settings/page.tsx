"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

const uploadSettingsSchema = z.object({
  maxFileSize: z.coerce.number().min(1, {
    message: "Maximum file size must be at least 1MB",
  }),
  allowedFileTypes: z.string().min(1, {
    message: "Please specify allowed file types",
  }),
  maxFilesPerUpload: z.coerce.number().min(1, {
    message: "Maximum files per upload must be at least 1",
  }),
  storageProvider: z.enum(["local", "s3", "cloudinary"]),
  compressionEnabled: z.boolean(),
  scanForMalware: z.boolean(),
})

const certificateSettingsSchema = z.object({
  certificateTitle: z.string().min(1, {
    message: "Certificate title is required",
  }),
  certificateDescription: z.string(),
  certificateFooter: z.string(),
  logoUrl: z
    .string()
    .url({
      message: "Please enter a valid URL for the logo",
    })
    .or(z.string().length(0)),
  signatureUrl: z
    .string()
    .url({
      message: "Please enter a valid URL for the signature",
    })
    .or(z.string().length(0)),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Please enter a valid hex color code",
  }),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Please enter a valid hex color code",
  }),
  fontFamily: z.string().min(1, {
    message: "Font family is required",
  }),
})

type UploadSettingsFormValues = z.infer<typeof uploadSettingsSchema>
type CertificateSettingsFormValues = z.infer<typeof certificateSettingsSchema>

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("upload")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const uploadForm = useForm<UploadSettingsFormValues>({
    resolver: zodResolver(uploadSettingsSchema),
    defaultValues: {
      maxFileSize: 5,
      allowedFileTypes: ".pdf,.jpg,.jpeg,.png,.doc,.docx",
      maxFilesPerUpload: 10,
      storageProvider: "s3",
      compressionEnabled: true,
      scanForMalware: true,
    },
  })

  const certificateForm = useForm<CertificateSettingsFormValues>({
    resolver: zodResolver(certificateSettingsSchema),
    defaultValues: {
      certificateTitle: "Certificate of Completion",
      certificateDescription:
        "This certifies that {student_name} has successfully completed the course {course_name} taught by {tutor_name}.",
      certificateFooter: "© EduConnect Learning Platform",
      logoUrl: "https://example.com/logo.png",
      signatureUrl: "https://example.com/signature.png",
      primaryColor: "#4f46e5",
      secondaryColor: "#f97316",
      fontFamily: "Montserrat, sans-serif",
    },
  })

  const onSubmitUploadSettings = async (values: UploadSettingsFormValues) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Upload settings updated",
        description: "Your upload settings have been saved successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update upload settings. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmitCertificateSettings = async (values: CertificateSettingsFormValues) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Certificate settings updated",
        description: "Your certificate settings have been saved successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update certificate settings. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <AdminSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">Platform Settings</h1>
              <p className="text-sm text-muted-foreground">Configure platform-wide settings</p>
            </div>
          </div>
          <div className="flex-1 space-y-4 p-8 pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="upload">Upload Settings</TabsTrigger>
                <TabsTrigger value="certificate">Certificate Template</TabsTrigger>
                <TabsTrigger value="email">Email Templates</TabsTrigger>
                <TabsTrigger value="payment">Payment Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Settings</CardTitle>
                    <CardDescription>Configure file upload settings for tutors and students</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...uploadForm}>
                      <form onSubmit={uploadForm.handleSubmit(onSubmitUploadSettings)} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={uploadForm.control}
                            name="maxFileSize"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Maximum File Size (MB)</FormLabel>
                                <FormControl>
                                  <Input type="number" min={1} {...field} />
                                </FormControl>
                                <FormDescription>Maximum file size allowed for uploads in megabytes</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={uploadForm.control}
                            name="maxFilesPerUpload"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Maximum Files Per Upload</FormLabel>
                                <FormControl>
                                  <Input type="number" min={1} {...field} />
                                </FormControl>
                                <FormDescription>Maximum number of files that can be uploaded at once</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={uploadForm.control}
                          name="allowedFileTypes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Allowed File Types</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                Comma-separated list of allowed file extensions (e.g., .pdf,.jpg,.png)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={uploadForm.control}
                          name="storageProvider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Storage Provider</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select storage provider" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="local">Local Storage</SelectItem>
                                  <SelectItem value="s3">Amazon S3</SelectItem>
                                  <SelectItem value="cloudinary">Cloudinary</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>Choose where uploaded files will be stored</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={uploadForm.control}
                            name="compressionEnabled"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Enable Compression</FormLabel>
                                  <FormDescription>
                                    Automatically compress images and PDFs to reduce storage usage
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={uploadForm.control}
                            name="scanForMalware"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Scan for Malware</FormLabel>
                                  <FormDescription>
                                    Automatically scan uploaded files for viruses and malware
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button type="submit" disabled={isSubmitting} className="mt-4">
                          {isSubmitting ? "Saving..." : "Save Upload Settings"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="certificate" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Certificate Template</CardTitle>
                    <CardDescription>Configure the default certificate template for course completions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...certificateForm}>
                      <form onSubmit={certificateForm.handleSubmit(onSubmitCertificateSettings)} className="space-y-6">
                        <FormField
                          control={certificateForm.control}
                          name="certificateTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Certificate Title</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>The main title displayed on the certificate</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={certificateForm.control}
                          name="certificateDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Certificate Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter certificate description..."
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                The main text of the certificate. Use {"{student_name}"}, {"{course_name}"}, and{" "}
                                {"{tutor_name}"} as placeholders.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={certificateForm.control}
                          name="certificateFooter"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Certificate Footer</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>Text to display at the bottom of the certificate</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={certificateForm.control}
                            name="logoUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Logo URL</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormDescription>URL to the logo image to display on the certificate</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={certificateForm.control}
                            name="signatureUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Signature URL</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                  URL to the signature image to display on the certificate
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                          <FormField
                            control={certificateForm.control}
                            name="primaryColor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Primary Color</FormLabel>
                                <div className="flex gap-2">
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <div
                                    className="h-10 w-10 rounded-md border"
                                    style={{ backgroundColor: field.value }}
                                  />
                                </div>
                                <FormDescription>Primary color for the certificate (hex code)</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={certificateForm.control}
                            name="secondaryColor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Secondary Color</FormLabel>
                                <div className="flex gap-2">
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <div
                                    className="h-10 w-10 rounded-md border"
                                    style={{ backgroundColor: field.value }}
                                  />
                                </div>
                                <FormDescription>Secondary color for the certificate (hex code)</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={certificateForm.control}
                            name="fontFamily"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Font Family</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select font family" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Montserrat, sans-serif">Montserrat</SelectItem>
                                    <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                                    <SelectItem value="Open Sans, sans-serif">Open Sans</SelectItem>
                                    <SelectItem value="Lato, sans-serif">Lato</SelectItem>
                                    <SelectItem value="Playfair Display, serif">Playfair Display</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>Font family to use for the certificate text</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="border rounded-md p-4 mt-6">
                          <h3 className="text-sm font-medium mb-2">Certificate Preview</h3>
                          <div className="aspect-[1.414/1] w-full bg-white rounded-md border overflow-hidden">
                            <div
                              className="h-full w-full flex flex-col items-center justify-center p-8 text-center"
                              style={{
                                fontFamily: certificateForm.watch("fontFamily"),
                                color: certificateForm.watch("primaryColor"),
                                borderColor: certificateForm.watch("secondaryColor"),
                                borderWidth: "8px",
                                borderStyle: "solid",
                              }}
                            >
                              <div className="mb-4 h-16 w-16 bg-muted rounded-md flex items-center justify-center">
                                Logo
                              </div>
                              <h1
                                className="text-2xl font-bold mb-2"
                                style={{ color: certificateForm.watch("primaryColor") }}
                              >
                                {certificateForm.watch("certificateTitle")}
                              </h1>
                              <p className="mb-6 text-sm">
                                {certificateForm
                                  .watch("certificateDescription")
                                  .replace("{student_name}", "Jane Doe")
                                  .replace("{course_name}", "Advanced JavaScript")
                                  .replace("{tutor_name}", "John Smith")}
                              </p>
                              <div className="mt-auto flex flex-col items-center">
                                <div className="h-12 w-32 bg-muted rounded-md flex items-center justify-center mb-2">
                                  Signature
                                </div>
                                <p className="text-xs" style={{ color: certificateForm.watch("secondaryColor") }}>
                                  {certificateForm.watch("certificateFooter")}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button type="submit" disabled={isSubmitting} className="mt-4">
                          <Save className="mr-2 h-4 w-4" />
                          {isSubmitting ? "Saving..." : "Save Certificate Template"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Templates</CardTitle>
                    <CardDescription>Configure email templates for various system notifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <h3 className="text-lg font-medium">Email Template Settings</h3>
                      <p className="text-sm text-muted-foreground mt-1 max-w-md">
                        This feature is coming soon. You will be able to customize email templates for various system
                        notifications.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payment" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Settings</CardTitle>
                    <CardDescription>Configure payment providers and processing settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <h3 className="text-lg font-medium">Payment Settings</h3>
                      <p className="text-sm text-muted-foreground mt-1 max-w-md">
                        This feature is coming soon. You will be able to configure payment providers and processing
                        settings.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}