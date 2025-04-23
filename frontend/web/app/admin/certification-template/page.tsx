"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { Award, Copy, Edit, Plus, Save, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const certificateTemplateSchema = z.object({
  name: z.string().min(1, { message: "Template name is required" }),
  description: z.string().optional(),
  background: z.string().min(1, { message: "Background color or image is required" }),
  titleText: z.string().min(1, { message: "Title text is required" }),
  bodyText: z.string().min(1, { message: "Body text is required" }),
  footerText: z.string().optional(),
  fontFamily: z.string().min(1, { message: "Font family is required" }),
  primaryColor: z.string().min(1, { message: "Primary color is required" }),
  secondaryColor: z.string().min(1, { message: "Secondary color is required" }),
  logoPosition: z.enum(["top", "bottom", "none"]),
  signaturePosition: z.enum(["bottom-left", "bottom-right", "bottom-center", "none"]),
})

type CertificateTemplateFormValues = z.infer<typeof certificateTemplateSchema>

interface CertificateTemplate extends CertificateTemplateFormValues {
  id: string
  isDefault: boolean
}

interface PreviewData {
  student_name: string
  course_name: string
  grade: string
  score: string
  issue_date: string
}

const mockTemplates: CertificateTemplate[] = [
  {
    id: "1",
    name: "Standard Certificate",
    description: "A professional certificate template suitable for most courses",
    background: "#ffffff",
    titleText: "Certificate of Completion",
    bodyText:
      "This is to certify that {{student_name}} has successfully completed the course {{course_name}} with {{grade}} grade.",
    footerText: "Issued on {{issue_date}}",
    fontFamily: "Georgia, serif",
    primaryColor: "#1e3a8a",
    secondaryColor: "#6b7280",
    logoPosition: "top",
    signaturePosition: "bottom-right",
    isDefault: true,
  },
  {
    id: "2",
    name: "Modern Achievement",
    description: "A modern, sleek certificate design",
    background: "linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)",
    titleText: "Certificate of Achievement",
    bodyText:
      "This certifies that {{student_name}} has successfully completed {{course_name}} with a score of {{score}}%.",
    footerText: "Awarded on {{issue_date}}",
    fontFamily: "Montserrat, sans-serif",
    primaryColor: "#0f766e",
    secondaryColor: "#475569",
    logoPosition: "top",
    signaturePosition: "bottom-center",
    isDefault: false,
  },
]

export default function CertificateTemplatesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [templates, setTemplates] = useState<CertificateTemplate[]>(mockTemplates)
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [previewData] = useState<PreviewData>({
    student_name: "John Doe",
    course_name: "Advanced JavaScript Programming",
    grade: "A",
    score: "95",
    issue_date: new Date().toLocaleDateString(),
  })

  const form = useForm<CertificateTemplateFormValues>({
    resolver: zodResolver(certificateTemplateSchema),
    defaultValues: {
      name: "",
      description: "",
      background: "#ffffff",
      titleText: "Certificate of Completion",
      bodyText: "",
      footerText: "",
      fontFamily: "Georgia, serif",
      primaryColor: "#1e3a8a",
      secondaryColor: "#6b7280",
      logoPosition: "top",
      signaturePosition: "bottom-right",
    },
  })

  const handleEditTemplate = (template: CertificateTemplate) => {
    setSelectedTemplate(template)
    form.reset({
      name: template.name,
      description: template.description,
      background: template.background,
      titleText: template.titleText,
      bodyText: template.bodyText,
      footerText: template.footerText || "",
      fontFamily: template.fontFamily,
      primaryColor: template.primaryColor,
      secondaryColor: template.secondaryColor,
      logoPosition: template.logoPosition,
      signaturePosition: template.signaturePosition,
    })
    setIsEditing(true)
    setIsCreating(false)
  }

  const handleCreateTemplate = () => {
    setSelectedTemplate(null)
    form.reset({
      name: "",
      description: "",
      background: "#ffffff",
      titleText: "Certificate of Completion",
      bodyText: "This is to certify that {{student_name}} has successfully completed the course {{course_name}}.",
      footerText: "Issued on {{issue_date}}",
      fontFamily: "Georgia, serif",
      primaryColor: "#1e3a8a",
      secondaryColor: "#6b7280",
      logoPosition: "top",
      signaturePosition: "bottom-right",
    })
    setIsCreating(true)
    setIsEditing(false)
  }

  const handleDeleteTemplate = () => {
    if (!selectedTemplate) return

    if (selectedTemplate.isDefault) {
      toast({
        variant: "destructive",
        title: "Cannot delete default template",
        description: "The default template cannot be deleted.",
      })
      setShowDeleteDialog(false)
      return
    }

    setTemplates(templates.filter((t) => t.id !== selectedTemplate.id))
    setSelectedTemplate(null)
    setShowDeleteDialog(false)
    toast({
      title: "Template deleted",
      description: "The certificate template has been deleted.",
    })
  }

  const handleSetDefault = (templateId: string) => {
    setTemplates(
      templates.map((t) => ({
        ...t,
        isDefault: t.id === templateId,
      })),
    )
    toast({
      title: "Default template updated",
      description: "The default certificate template has been updated.",
    })
  }

  const onSubmit: SubmitHandler<CertificateTemplateFormValues> = async (values) => {
    if (isCreating) {
      const newTemplate: CertificateTemplate = {
        id: Date.now().toString(),
        ...values,
        isDefault: false,
      }
      setTemplates([...templates, newTemplate])
      toast({
        title: "Template created",
        description: "The new certificate template has been created.",
      })
    } else if (isEditing && selectedTemplate) {
      setTemplates(
        templates.map((t) =>
          t.id === selectedTemplate.id
            ? {
                ...t,
                ...values,
              }
            : t,
        ),
      )
      toast({
        title: "Template updated",
        description: "The certificate template has been updated.",
      })
    }

    setIsCreating(false)
    setIsEditing(false)
  }

  const replacePlaceholders = (text: string): string => {
    return text
      .replace(/{{student_name}}/g, previewData.student_name)
      .replace(/{{course_name}}/g, previewData.course_name)
      .replace(/{{grade}}/g, previewData.grade)
      .replace(/{{score}}/g, previewData.score)
      .replace(/{{issue_date}}/g, previewData.issue_date)
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <AdminSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold">Certificate Templates</h1>
              <p className="text-sm text-muted-foreground">Manage certificate templates for course completion</p>
            </div>
            <Button onClick={handleCreateTemplate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>
          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="grid gap-4 md:grid-cols-[300px_1fr]">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Templates</CardTitle>
                    <CardDescription>Select a template to preview or edit</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className={`flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-muted ${
                            selectedTemplate?.id === template.id ? "bg-muted" : ""
                          }`}
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <div className="flex items-center space-x-2">
                            <Award className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{template.name}</p>
                              {template.isDefault && <p className="text-xs text-muted-foreground">Default Template</p>}
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditTemplate(template)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!template.isDefault && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedTemplate(template)
                                  setShowDeleteDialog(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {selectedTemplate && !isEditing && !isCreating && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Template Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleEditTemplate(selectedTemplate)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Template
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          toast({
                            title: "Template exported",
                            description: "The certificate template has been exported.",
                          })
                        }}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Export Template
                      </Button>
                      {!selectedTemplate.isDefault && (
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => handleSetDefault(selectedTemplate.id)}
                        >
                          <Award className="mr-2 h-4 w-4" />
                          Set as Default
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-4">
                {isEditing || isCreating ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>{isCreating ? "Create New Template" : "Edit Template"}</CardTitle>
                      <CardDescription>
                        {isCreating ? "Create a new certificate template" : "Edit the selected certificate template"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Template Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Standard Certificate" {...field} />
                                </FormControl>
                                <FormDescription>A name to identify this template</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="e.g. A professional certificate template suitable for most courses"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>A brief description of the template (optional)</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="background"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Background</FormLabel>
                                  <FormControl>
                                    <Input placeholder="#ffffff or URL" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Color code or image URL for the certificate background
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="fontFamily"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Font Family</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a font" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Georgia, serif">Georgia</SelectItem>
                                      <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                                      <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                                      <SelectItem value="'Helvetica Neue', sans-serif">Helvetica</SelectItem>
                                      <SelectItem value="Montserrat, sans-serif">Montserrat</SelectItem>
                                      <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>The main font for the certificate</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="primaryColor"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Primary Color</FormLabel>
                                  <div className="flex space-x-2">
                                    <FormControl>
                                      <Input placeholder="#1e3a8a" {...field} />
                                    </FormControl>
                                    <div
                                      className="h-10 w-10 rounded-md border"
                                      style={{ backgroundColor: field.value }}
                                    ></div>
                                  </div>
                                  <FormDescription>Main color for headings and borders</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="secondaryColor"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Secondary Color</FormLabel>
                                  <div className="flex space-x-2">
                                    <FormControl>
                                      <Input placeholder="#6b7280" {...field} />
                                    </FormControl>
                                    <div
                                      className="h-10 w-10 rounded-md border"
                                      style={{ backgroundColor: field.value }}
                                    ></div>
                                  </div>
                                  <FormDescription>Color for secondary text</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="titleText"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title Text</FormLabel>
                                <FormControl>
                                  <Input placeholder="Certificate of Completion" {...field} />
                                </FormControl>
                                <FormDescription>The main title of the certificate</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="bodyText"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Body Text</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="This is to certify that {{student_name}} has successfully completed the course {{course_name}} with {{grade}} grade."
                                    className="min-h-[100px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  The main text of the certificate. Use placeholders like {{ student_name }},
                                  {{ course_name }}, {{ grade }}, {{ score }}, and {{ issue_date }}.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="footerText"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Footer Text</FormLabel>
                                <FormControl>
                                  <Input placeholder="Issued on {{issue_date}}" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Text to appear at the bottom of the certificate (optional)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="logoPosition"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Logo Position</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select logo position" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="top">Top</SelectItem>
                                      <SelectItem value="bottom">Bottom</SelectItem>
                                      <SelectItem value="none">No Logo</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>Position of the platform logo</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="signaturePosition"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Signature Position</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select signature position" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                      <SelectItem value="bottom-center">Bottom Center</SelectItem>
                                      <SelectItem value="none">No Signature</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>Position of the tutor signature</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              type="button"
                              onClick={() => {
                                setIsEditing(false)
                                setIsCreating(false)
                              }}
                            >
                              Cancel
                            </Button>
                            <Button type="submit">
                              <Save className="mr-2 h-4 w-4" />
                              {isCreating ? "Create Template" : "Save Changes"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                ) : selectedTemplate ? (
                  <Tabs defaultValue="preview">
                    <TabsList className="w-full">
                      <TabsTrigger value="preview" className="flex-1">
                        Preview
                      </TabsTrigger>
                      <TabsTrigger value="details" className="flex-1">
                        Template Details
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="preview" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Certificate Preview</CardTitle>
                          <CardDescription>Preview how the certificate will look</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div
                            className="relative mx-auto aspect-[1.4/1] w-full max-w-3xl overflow-hidden rounded-lg border p-8 shadow-md"
                            style={{
                              background: selectedTemplate.background,
                              fontFamily: selectedTemplate.fontFamily,
                            }}
                          >
                            {selectedTemplate.logoPosition === "top" && (
                              <div className="mb-8 flex justify-center">
                                <div className="h-16 w-16 rounded-full bg-muted"></div>
                              </div>
                            )}

                            <div className="text-center">
                              <h1 className="mb-6 text-3xl font-bold" style={{ color: selectedTemplate.primaryColor }}>
                                {selectedTemplate.titleText}
                              </h1>
                              <p className="mb-8 text-lg" style={{ color: selectedTemplate.secondaryColor }}>
                                {replacePlaceholders(selectedTemplate.bodyText)}
                              </p>
                            </div>

                            {selectedTemplate.signaturePosition !== "none" && (
                              <div
                                className={`mt-12 flex ${
                                  selectedTemplate.signaturePosition === "bottom-center"
                                    ? "justify-center"
                                    : selectedTemplate.signaturePosition === "bottom-right"
                                      ? "justify-end"
                                      : "justify-start"
                                }`}
                              >
                                <div className="text-center">
                                  <div className="mb-2 h-px w-40 bg-muted-foreground"></div>
                                  <p className="text-sm" style={{ color: selectedTemplate.secondaryColor }}>
                                    Tutor Signature
                                  </p>
                                </div>
                              </div>
                            )}

                            {selectedTemplate.footerText && (
                              <div className="absolute bottom-4 left-0 right-0 text-center">
                                <p className="text-sm" style={{ color: selectedTemplate.secondaryColor }}>
                                  {replacePlaceholders(selectedTemplate.footerText)}
                                </p>
                              </div>
                            )}

                            {selectedTemplate.logoPosition === "bottom" && (
                              <div className="absolute bottom-4 right-4">
                                <div className="h-12 w-12 rounded-full bg-muted"></div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="details">
                      <Card>
                        <CardHeader>
                          <CardTitle>{selectedTemplate.name}</CardTitle>
                          <CardDescription>{selectedTemplate.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid gap-2 md:grid-cols-2">
                              <div>
                                <h3 className="text-sm font-medium">Background</h3>
                                <p className="text-sm text-muted-foreground">{selectedTemplate.background}</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium">Font Family</h3>
                                <p className="text-sm text-muted-foreground">{selectedTemplate.fontFamily}</p>
                              </div>
                            </div>
                            <div className="grid gap-2 md:grid-cols-2">
                              <div>
                                <h3 className="text-sm font-medium">Primary Color</h3>
                                <div className="flex items-center space-x-2">
                                  <div
                                    className="h-4 w-4 rounded-full"
                                    style={{ backgroundColor: selectedTemplate.primaryColor }}
                                  ></div>
                                  <p className="text-sm text-muted-foreground">{selectedTemplate.primaryColor}</p>
                                </div>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium">Secondary Color</h3>
                                <div className="flex items-center space-x-2">
                                  <div
                                    className="h-4 w-4 rounded-full"
                                    style={{ backgroundColor: selectedTemplate.secondaryColor }}
                                  ></div>
                                  <p className="text-sm text-muted-foreground">{selectedTemplate.secondaryColor}</p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">Title Text</h3>
                              <p className="text-sm text-muted-foreground">{selectedTemplate.titleText}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">Body Text</h3>
                              <p className="text-sm text-muted-foreground">{selectedTemplate.bodyText}</p>
                            </div>
                            {selectedTemplate.footerText && (
                              <div>
                                <h3 className="text-sm font-medium">Footer Text</h3>
                                <p className="text-sm text-muted-foreground">{selectedTemplate.footerText}</p>
                              </div>
                            )}
                            <div className="grid gap-2 md:grid-cols-2">
                              <div>
                                <h3 className="text-sm font-medium">Logo Position</h3>
                                <p className="text-sm capitalize text-muted-foreground">
                                  {selectedTemplate.logoPosition}
                                </p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium">Signature Position</h3>
                                <p className="text-sm capitalize text-muted-foreground">
                                  {selectedTemplate.signaturePosition}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Certificate Templates</CardTitle>
                      <CardDescription>
                        Select a template from the list or create a new one to get started
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex h-64 items-center justify-center">
                      <div className="text-center">
                        <Award className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No Template Selected</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Select a template from the list or create a new one
                        </p>
                        <Button className="mt-4" onClick={handleCreateTemplate}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTemplate}>
              Delete Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}