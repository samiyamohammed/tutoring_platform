"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { FileOutput, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface CertificateTemplate {
  id: string;
  name: string;
  description?: string;
  background: string;
  titleText: string;
  bodyText: string;
  footerText?: string;
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  logoPosition: string;
  signaturePosition: string;
}

const formSchema = z.object({
  studentName: z.string().min(1, { message: "Student name is required" }),
  courseName: z.string().min(1, { message: "Course name is required" }),
  grade: z.string().optional(),
  score: z.string().optional(),
  instructorName: z.string().optional(),
  issueDate: z.string().min(1, { message: "Issue date is required" }),
});

export default function CertificateGenerationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [template, setTemplate] = useState<CertificateTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: "",
      courseName: "",
      grade: "",
      score: "",
      instructorName: "",
      issueDate: new Date().toISOString().split("T")[0],
    },
  });

  // Fetch template data
  useEffect(() => {
    const templateId = searchParams.get("templateId");
    if (!templateId) {
      router.push("/admin/certificates/templates");
      return;
    }

    // In a real app, you would fetch the template from your API
    const fetchTemplate = async () => {
      try {
        // Mock data - replace with actual API call
        const mockTemplates: CertificateTemplate[] = [
          {
            id: "1",
            name: "Standard Certificate",
            description:
              "A professional certificate template suitable for most courses",
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
          },
        ];

        const foundTemplate = mockTemplates.find((t) => t.id === templateId);
        if (foundTemplate) {
          setTemplate(foundTemplate);
        } else {
          throw new Error("Template not found");
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error loading template",
          description: "Could not load the certificate template.",
        });
        router.push("/admin/certificates/templates");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [searchParams, router, toast]);

  const replacePlaceholders = (
    text: string,
    data: z.infer<typeof formSchema>
  ): string => {
    return text
      .replace(/{{student_name}}/g, data.studentName)
      .replace(/{{course_name}}/g, data.courseName)
      .replace(/{{grade}}/g, data.grade || "")
      .replace(/{{score}}/g, data.score || "")
      .replace(/{{issue_date}}/g, data.issueDate)
      .replace(/{{instructor_name}}/g, data.instructorName || "");
  };

  const handleGeneratePDF = async () => {
    if (!certificateRef.current) return;

    try {
      const canvas = await html2canvas(certificateRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        `certificate_${form.getValues("studentName").replace(/\s+/g, "_")}.pdf`
      );

      toast({
        title: "Certificate generated",
        description: "The certificate has been downloaded as PDF.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: "There was an error generating the certificate.",
      });
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <AdminSidebar />
          <main className="flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <p>Loading template...</p>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (!template) {
    return (
      <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
          <AdminSidebar />
          <main className="flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <p>Template not found</p>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr]">
        <AdminSidebar />
        <main className="flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/certificates/templates")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Templates
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Generate Certificate</h1>
              <p className="text-sm text-muted-foreground">
                Using template: {template.name}
              </p>
            </div>
          </div>
          <div className="flex-1 p-8 pt-6">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Certificate Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form className="space-y-4">
                        <FormField
                          control={form.control}
                          name="studentName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Student Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="courseName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Course Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Advanced JavaScript"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="grade"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Grade (optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="A" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="score"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Score (optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="95" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="instructorName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Instructor Name (optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Dr. Smith" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="issueDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Issue Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="pt-4">
                          <Button
                            type="button"
                            className="w-full"
                            onClick={handleGeneratePDF}
                            disabled={!form.formState.isValid}
                          >
                            <FileOutput className="mr-2 h-4 w-4" />
                            Generate PDF Certificate
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Certificate Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      ref={certificateRef}
                      className="relative mx-auto aspect-[1.4/1] w-full max-w-3xl overflow-hidden rounded-lg border p-8 shadow-md"
                      style={{
                        background: template.background,
                        fontFamily: template.fontFamily,
                      }}
                    >
                      {template.logoPosition === "top" && (
                        <div className="mb-8 flex justify-center">
                          <div className="h-16 w-16 rounded-full bg-muted"></div>
                        </div>
                      )}

                      <div className="text-center">
                        <h1
                          className="mb-6 text-3xl font-bold"
                          style={{ color: template.primaryColor }}
                        >
                          {template.titleText}
                        </h1>
                        <p
                          className="mb-8 text-lg"
                          style={{ color: template.secondaryColor }}
                        >
                          {replacePlaceholders(
                            template.bodyText,
                            form.getValues()
                          )}
                        </p>
                      </div>

                      {template.signaturePosition !== "none" && (
                        <div
                          className={`mt-12 flex ${
                            template.signaturePosition === "bottom-center"
                              ? "justify-center"
                              : template.signaturePosition === "bottom-right"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div className="text-center">
                            <div className="mb-2 h-px w-40 bg-muted-foreground"></div>
                            <p
                              className="text-sm"
                              style={{ color: template.secondaryColor }}
                            >
                              {form.getValues().instructorName ||
                                "Instructor Signature"}
                            </p>
                          </div>
                        </div>
                      )}

                      {template.footerText && (
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                          <p
                            className="text-sm"
                            style={{ color: template.secondaryColor }}
                          >
                            {replacePlaceholders(
                              template.footerText,
                              form.getValues()
                            )}
                          </p>
                        </div>
                      )}

                      {template.logoPosition === "bottom" && (
                        <div className="absolute bottom-4 right-4">
                          <div className="h-12 w-12 rounded-full bg-muted"></div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
