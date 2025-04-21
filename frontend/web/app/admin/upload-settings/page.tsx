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
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const uploadSettingsSchema = z.object({
  maxFileSize: z.coerce.number().min(1, { message: "Maximum file size must be at least 1MB" }),
  allowedFileTypes: z.array(z.string()).min(1, { message: "At least one file type must be allowed" }),
  maxFilesPerUpload: z.coerce.number().min(1, { message: "Maximum files per upload must be at least 1" }),
  maxTotalStorage: z.coerce.number().min(1, { message: "Maximum total storage must be at least 1GB" }),
  enableCompression: z.boolean().default(false),
  compressionQuality: z.coerce.number().min(1).max(100).optional(),
  scanForMalware: z.boolean().default(true),
  allowPublicSharing: z.boolean().default(false),
  defaultVisibility: z.enum(["private", "public", "restricted"]),
  autoDeleteAfter: z.coerce.number().min(0).optional(),
  autoDeleteUnit: z.enum(["days", "weeks", "months", "years", "never"]).default("never"),
})

type UploadSettingsFormValues = z.infer<typeof uploadSettingsSchema>

export default function UploadSettingsPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<UploadSettingsFormValues>({
    resolver: zodResolver(uploadSettingsSchema) as any,
    defaultValues: {
      maxFileSize: 10,
      allowedFileTypes: ["pdf", "doc", "docx", "jpg", "jpeg", "png"],
      maxFilesPerUpload: 5,
      maxTotalStorage: 1000,
      enableCompression: true,
      compressionQuality: 80,
      scanForMalware: true,
      allowPublicSharing: false,
      defaultVisibility: "private",
      autoDeleteAfter: 0,
      autoDeleteUnit: "never",
    },
  })

  const watchEnableCompression = form.watch("enableCompression")
  const watchAutoDeleteUnit = form.watch("autoDeleteUnit")

  const onSubmit = async (values: UploadSettingsFormValues) => {
    setIsSubmitting(true)

    try {
      // This would be replaced with actual API call
      console.log(values)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Settings saved",
        description: "Upload settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings. Please try again.",
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
              <h1 className="text-lg font-semibold">Upload Settings</h1>
              <p className="text-sm text-muted-foreground">Configure file upload settings for tutors</p>
            </div>
          </div>
          <div className="flex-1 space-y-4 p-8 pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Tabs defaultValue="general" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="storage">Storage</TabsTrigger>
                  </TabsList>
                  <TabsContent value="general" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>General Upload Settings</CardTitle>
                        <CardDescription>Configure basic upload settings for tutors</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="maxFileSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maximum File Size (MB)</FormLabel>
                              <FormControl>
                                <Input type="number" min={1} {...field} />
                              </FormControl>
                              <FormDescription>
                                The maximum size of a single file that can be uploaded (in megabytes)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="allowedFileTypes"
                          render={({ field }) => (
                            <FormItem>
                              <div className="mb-4">
                                <FormLabel className="text-base">Allowed File Types</FormLabel>
                                <FormDescription>
                                  Select the file types that tutors are allowed to upload
                                </FormDescription>
                              </div>
                              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                                {[
                                  { id: "pdf", label: "PDF (.pdf)" },
                                  { id: "doc", label: "Word (.doc)" },
                                  { id: "docx", label: "Word (.docx)" },
                                  { id: "jpg", label: "JPEG (.jpg)" },
                                  { id: "jpeg", label: "JPEG (.jpeg)" },
                                  { id: "png", label: "PNG (.png)" },
                                  { id: "gif", label: "GIF (.gif)" },
                                  { id: "mp4", label: "Video (.mp4)" },
                                  { id: "mp3", label: "Audio (.mp3)" },
                                  { id: "ppt", label: "PowerPoint (.ppt)" },
                                  { id: "pptx", label: "PowerPoint (.pptx)" },
                                  { id: "zip", label: "Archive (.zip)" },
                                ].map((item) => (
                                  <FormField
                                    key={item.id}
                                    control={form.control}
                                    name="allowedFileTypes"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={item.id}
                                          className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(item.id)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...field.value, item.id])
                                                  : field.onChange(field.value?.filter((value) => value !== item.id))
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="font-normal">{item.label}</FormLabel>
                                        </FormItem>
                                      )
                                    }}
                                  />
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="maxFilesPerUpload"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maximum Files Per Upload</FormLabel>
                              <FormControl>
                                <Input type="number" min={1} {...field} />
                              </FormControl>
                              <FormDescription>
                                The maximum number of files that can be uploaded at once
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="enableCompression"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Enable Image Compression</FormLabel>
                                <FormDescription>Automatically compress images to reduce storage usage</FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        {watchEnableCompression && (
                          <FormField
                            control={form.control}
                            name="compressionQuality"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Compression Quality (%)</FormLabel>
                                <FormControl>
                                  <Input type="number" min={1} max={100} {...field} />
                                </FormControl>
                                <FormDescription>
                                  The quality of compressed images (1-100, higher is better quality but larger file
                                  size)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="security" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>Configure security settings for file uploads</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="scanForMalware"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Scan for Malware</FormLabel>
                                <FormDescription>
                                  Automatically scan uploaded files for malware and viruses
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="allowPublicSharing"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Allow Public Sharing</FormLabel>
                                <FormDescription>
                                  Allow tutors to share files publicly with anyone who has the link
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="defaultVisibility"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default File Visibility</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select default visibility" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="private">Private (Only the uploader)</SelectItem>
                                  <SelectItem value="restricted">Restricted (Enrolled students only)</SelectItem>
                                  <SelectItem value="public">Public (Anyone with the link)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>The default visibility setting for newly uploaded files</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="storage" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Storage Settings</CardTitle>
                        <CardDescription>Configure storage settings for file uploads</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="maxTotalStorage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maximum Total Storage (GB)</FormLabel>
                              <FormControl>
                                <Input type="number" min={1} {...field} />
                              </FormControl>
                              <FormDescription>
                                The maximum total storage space allowed per tutor (in gigabytes)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="autoDeleteUnit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Auto-Delete Unused Files</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select auto-delete period" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="never">Never</SelectItem>
                                  <SelectItem value="days">Days</SelectItem>
                                  <SelectItem value="weeks">Weeks</SelectItem>
                                  <SelectItem value="months">Months</SelectItem>
                                  <SelectItem value="years">Years</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Automatically delete files that haven't been accessed for a specified period
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {watchAutoDeleteUnit !== "never" && (
                          <FormField
                            control={form.control}
                            name="autoDeleteAfter"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Auto-Delete After</FormLabel>
                                <FormControl>
                                  <Input type="number" min={1} {...field} />
                                </FormControl>
                                <FormDescription>
                                  The number of {watchAutoDeleteUnit} after which unused files will be deleted
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}