"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FileText, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  qualifications: z.string().min(10, {
    message: "Please provide more details about your qualifications.",
  }),
  specialization: z.string().min(1, {
    message: "Please enter your specialization.",
  }),
  experience: z.string().min(10, {
    message: "Please provide more details about your experience.",
  }),
  teachingApproach: z.string().min(10, {
    message: "Please describe your teaching approach.",
  }),
  documentType: z.string({
    required_error: "Please select a document type",
  }),
  documentDescription: z.string().min(1, {
    message: "Please provide a description for your document.",
  }),
  documents: z
    .array(
      z.object({
        name: z.string(),
        size: z.number().max(MAX_FILE_SIZE, "File size must be less than 5MB"),
        type: z
          .string()
          .refine(
            (type) => ACCEPTED_FILE_TYPES.includes(type),
            "File type must be PDF, JPEG, or PNG"
          ),
        url: z.string(),
      })
    )
    .min(1, "At least one document is required"),
});

export default function TutorVerificationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<File>>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      qualifications: "",
      specialization: "",
      experience: "",
      teachingApproach: "",
      documentType: "",
      documentDescription: "",
      documents: [],
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const validFiles = newFiles.filter(
      (file) =>
        file.size <= MAX_FILE_SIZE && ACCEPTED_FILE_TYPES.includes(file.type)
    );

    if (validFiles.length !== newFiles.length) {
      toast({
        variant: "destructive",
        title: "Invalid file(s)",
        description:
          "Some files were rejected. Files must be PDF, JPEG, or PNG and less than 5MB.",
      });
    }

    setUploadedFiles((prev) => [...prev, ...validFiles]);

    // Update form value
    const formattedFiles = validFiles.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    }));

    const currentDocs = form.getValues("documents") || [];
    form.setValue("documents", [...currentDocs, ...formattedFiles], {
      shouldValidate: true,
    });
  };

  const removeFile = (index: number) => {
    const currentFiles = [...uploadedFiles];
    currentFiles.splice(index, 1);
    setUploadedFiles(currentFiles);

    const currentDocs = form.getValues("documents");
    currentDocs.splice(index, 1);
    form.setValue("documents", currentDocs, { shouldValidate: true });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      // This would be replaced with actual API call
      console.log(values);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Verification request submitted",
        description: "Your documents have been submitted for review.",
      });

      // Redirect to pending page
      router.push("/tutor/verification/pending");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit verification request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold">Tutor Verification</h1>
          <p className="text-sm text-muted-foreground">
            Submit your documents to verify your identity and qualifications
          </p>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Tutor Verification</CardTitle>
            <CardDescription>
              Please provide your information and upload the necessary documents
              to verify your identity and qualifications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter your full legal name as it appears on your ID.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="your.email@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Your professional email address
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your contact phone number
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
                        <FormLabel>Specialization</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Mathematics, Physics, Computer Science"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Your main teaching subjects
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="qualifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualifications</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your educational qualifications..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        List your degrees, certifications, and other relevant
                        qualifications.
                      </FormDescription>
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
                          placeholder="Describe your teaching experience..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe your teaching experience, including years of
                        experience and subjects taught.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teachingApproach"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teaching Approach</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your teaching methodology and approach..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Explain your teaching style and methods
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="documentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="degree">
                              Degree Certificate
                            </SelectItem>
                            <SelectItem value="id">Government ID</SelectItem>
                            <SelectItem value="teaching_cert">
                              Teaching Certificate
                            </SelectItem>
                            <SelectItem value="resume">Resume/CV</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the type of document you're uploading
                        </FormDescription>
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
                          <Input
                            placeholder="e.g. Master's Degree in Computer Science"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Briefly describe the document
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="documents"
                  render={() => (
                    <FormItem>
                      <FormLabel>Upload Documents</FormLabel>
                      <FormControl>
                        <div className="grid gap-4">
                          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted/50 transition-colors">
                            <Input
                              type="file"
                              id="file-upload"
                              className="hidden"
                              onChange={handleFileUpload}
                              accept={ACCEPTED_FILE_TYPES.join(",")}
                              multiple
                            />
                            <label
                              htmlFor="file-upload"
                              className="flex flex-col items-center justify-center cursor-pointer"
                            >
                              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                              <p className="text-sm font-medium">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                PDF, JPEG, or PNG (max 5MB)
                              </p>
                            </label>
                          </div>
                          {uploadedFiles.length > 0 && (
                            <div className="space-y-2">
                              {uploadedFiles.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between rounded-lg border p-3"
                                >
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                      <p className="text-sm font-medium truncate max-w-[200px]">
                                        {file.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {(file.size / 1024 / 1024).toFixed(2)}{" "}
                                        MB
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeFile(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload your ID, degree certificates, teaching
                        certifications, and other relevant documents.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit for Verification"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
