"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { BookOpen, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-provider"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
})

type Toast = {
  id: string;
  title: string;
  description: string;
  variant?: "default" | "destructive";
}

export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    setIsClient(true)
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const showToast = (toast: Omit<Toast, "id">) => {
    if (!isClient) return;
    
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
    
    setTimeout(() => {
      dismissToast(id)
    }, 5000)
  }

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: values.email.trim(),
          password: values.password
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        let errorMessage = "Login failed. Please try again.";
        
        if (response.status === 400) {
          errorMessage = responseData.message || "Invalid request. Please check your input.";
          if (responseData.errors) {
            errorMessage = Object.values(responseData.errors).join('\n');
          }
        } else if (response.status === 401) {
          errorMessage = "The email or password you entered is incorrect.";
        } else if (response.status === 404) {
          errorMessage = "User not found. Please check your email or sign up.";
        }

        showToast({
          variant: "destructive",
          title: `Login Failed (${response.status})`,
          description: errorMessage,
        });
        return;
      }

      const { token, user } = responseData;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      showToast({
        title: "Login Successful",
        description: `Welcome back, ${user.name || user.email}!`,
      });

      const roleRedirects = {
        admin: "/admin/dashboard",
        tutor: "/tutor/dashboard",
        student: "/student/dashboard",
        default: "/"
      };

      const redirectPath = roleRedirects[user.role as keyof typeof roleRedirects] || roleRedirects.default;
      window.location.href = redirectPath;

    } catch (error) {
      console.error('Login error:', error);
      showToast({
        variant: "destructive",
        title: "Network Error",
        description: "Could not connect to the server. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      {/* Toast Container - Only rendered on client */}
      {isClient && (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`relative flex w-full max-w-sm items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all ${
                toast.variant === "destructive"
                  ? "border-red-500 bg-red-50 text-red-900"
                  : "border-gray-200 bg-white text-gray-900"
              }`}
            >
              <div className="grid gap-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                <p className="text-sm opacity-90">{toast.description}</p>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="absolute right-2 top-2 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Link href="/" className="absolute left-4 top-4 flex items-center gap-2 md:left-8 md:top-8">
        <BookOpen className="h-6 w-6" />
        <span className="font-bold">EduConnect</span>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>Enter your email and password to sign in to your account</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            <Link href="/auth/forgot-password" className="underline underline-offset-4 hover:text-primary">
              Forgot password?
            </Link>
          </div>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="underline underline-offset-4 hover:text-primary">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}