// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { BookOpen, X } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { useAuth } from "@/lib/auth-provider";

// const formSchema = z.object({
//   email: z.string().email({
//     message: "Please enter a valid email address.",
//   }),
//   password: z.string().min(1, {
//     message: "Password is required.",
//   }),
// });

// type Toast = {
//   id: string;
//   title: string;
//   description: string;
//   variant?: "default" | "destructive";
// };

// export default function SignInPage() {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [isClient, setIsClient] = useState(false);
//   const [toasts, setToasts] = useState<Toast[]>([]);

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });

//   const showToast = (toast: Omit<Toast, "id">) => {
//     if (!isClient) return;

//     const id = Math.random().toString(36).substring(2, 9);
//     setToasts((prev) => [...prev, { ...toast, id }]);

//     setTimeout(() => {
//       dismissToast(id);
//     }, 5000);
//   };

//   const dismissToast = (id: string) => {
//     setToasts((prev) => prev.filter((t) => t.id !== id));
//   };

//   async function onSubmit(values: z.infer<typeof formSchema>) {
//     setIsLoading(true);

//     try {
//       const response = await fetch("http://localhost:5000/api/auth/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//         body: JSON.stringify({
//           email: values.email.trim(),
//           password: values.password,
//         }),
//       });

//       const responseData = await response.json();

//       if (!response.ok) {
//         let errorMessage = "Login failed. Please try again.";

//         if (response.status === 400) {
//           errorMessage =
//             responseData.message || "Invalid request. Please check your input.";
//           if (responseData.errors) {
//             errorMessage = Object.values(responseData.errors).join("\n");
//           }
//         } else if (response.status === 401) {
//           errorMessage = "The email or password you entered is incorrect.";
//         } else if (response.status === 404) {
//           errorMessage = "User not found. Please check your email or sign up.";
//         }

//         showToast({
//           variant: "destructive",
//           title: `Login Failed (${response.status})`,
//           description: errorMessage,
//         });
//         return;
//       }

//       const { token, user } = responseData;

//       localStorage.setItem("token", token);
//       localStorage.setItem("user", JSON.stringify(user));

//       showToast({
//         title: "Login Successful",
//         description: `Welcome back, ${user.name || user.email}!`,
//       });

//       const roleRedirects = {
//         admin: "/admin/dashboard",
//         tutor: "/tutor/dashboard",
//         student: "/student/dashboard",
//         default: "/",
//       };

//       const redirectPath =
//         roleRedirects[user.role as keyof typeof roleRedirects] ||
//         roleRedirects.default;
//       window.location.href = redirectPath;
//     } catch (error) {
//       console.error("Login error:", error);
//       showToast({
//         variant: "destructive",
//         title: "Network Error",
//         description: "Could not connect to the server. Please try again later.",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   return (
//     <div className="container flex h-screen w-screen flex-col items-center justify-center">
//       {/* Toast Container - Only rendered on client */}
//       {isClient && (
//         <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
//           {toasts.map((toast) => (
//             <div
//               key={toast.id}
//               className={`relative flex w-full max-w-sm items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all ${
//                 toast.variant === "destructive"
//                   ? "border-red-500 bg-red-50 text-red-900"
//                   : "border-gray-200 bg-white text-gray-900"
//               }`}
//             >
//               <div className="grid gap-1">
//                 <p className="text-sm font-semibold">{toast.title}</p>
//                 <p className="text-sm opacity-90">{toast.description}</p>
//               </div>
//               <button
//                 onClick={() => dismissToast(toast.id)}
//                 className="absolute right-2 top-2 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none"
//               >
//                 <X className="h-4 w-4" />
//               </button>
//             </div>
//           ))}
//         </div>
//       )}

//       <Link
//         href="/"
//         className="absolute left-4 top-4 flex items-center gap-2 md:left-8 md:top-8"
//       >
//         <BookOpen className="h-6 w-6" />
//         <span className="font-bold">EduConnect</span>
//       </Link>
//       <Card className="w-full max-w-md">
//         <CardHeader className="space-y-1">
//           <CardTitle className="text-2xl">Sign in</CardTitle>
//           <CardDescription>
//             Enter your email and password to sign in to your account
//           </CardDescription>
//         </CardHeader>

//         <CardContent>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//               <FormField
//                 control={form.control}
//                 name="email"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Email</FormLabel>
//                     <FormControl>
//                       <Input placeholder="john.doe@example.com" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="password"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Password</FormLabel>
//                     <FormControl>
//                       <Input type="password" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <Button type="submit" className="w-full" disabled={isLoading}>
//                 {isLoading ? "Signing in..." : "Sign in"}
//               </Button>
//             </form>
//           </Form>
//         </CardContent>
//         <CardFooter className="flex flex-col space-y-4">
//           <div className="text-center text-sm">
//             <Link
//               href="/auth/forgot-password"
//               className="underline underline-offset-4 hover:text-primary"
//             >
//               Forgot password?
//             </Link>
//           </div>
//           <div className="text-center text-sm">
//             Don&apos;t have an account?{" "}
//             <Link
//               href="/auth/signup"
//               className="underline underline-offset-4 hover:text-primary"
//             >
//               Sign up
//             </Link>
//           </div>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BookOpen, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

type Toast = {
  id: string;
  title: string;
  description: string;
  variant?: "default" | "destructive";
};

type Tutor = {
  _id: string;
  email: string;
  verification_status: string;
  name: string;
  role: string;
};

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const addDebugInfo = (message: string) => {
    setDebugInfo((prev) => [
      ...prev,
      `${new Date().toISOString()}: ${message}`,
    ]);
    console.log(message);
  };

  const showToast = (toast: Omit<Toast, "id">) => {
    if (!isClient) return;

    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);

    setTimeout(() => {
      dismissToast(id);
    }, 5000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchTutorData = async (
    token: string,
    email: string
  ): Promise<Tutor | null> => {
    try {
      // addDebugInfo(`Fetching tutor data for ${email}`);
      const response = await fetch("http://localhost:5000/api/users/tutors", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // addDebugInfo(
        // `Failed to fetch tutors: ${response.status} ${response.statusText}`
        // );
        return null;
      }

      const tutors: Tutor[] = await response.json();
      // addDebugInfo(`Found ${tutors.length} tutors in system`);

      const currentTutor = tutors.find((t) => t.email === email);
      if (!currentTutor) {
        // addDebugInfo(`Tutor with email ${email} not found in tutors list`);
        return null;
      }

      // addDebugInfo(`Found tutor: ${JSON.stringify(currentTutor, null, 2)}`);
      return currentTutor;
    } catch (error) {
      addDebugInfo(
        `Error fetching tutor data: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return null;
    }
  };

  const handleTutorRedirect = async (token: string, email: string) => {
    // addDebugInfo("Starting tutor verification check...");

    const tutor = await fetchTutorData(token, email);
    if (!tutor) {
      // addDebugInfo("Tutor data not available, redirecting to onboarding");
      showToast({
        title: "Verification Required",
        description: "Please complete your tutor verification",
        variant: "default",
      });
      return "/tutor/pendingandinitial";
    }

    // addDebugInfo(`Tutor verification status: ${tutor.verification_status}`);

    switch (tutor.verification_status.toLowerCase()) {
      case "approved":
        // addDebugInfo("Tutor approved, redirecting to dashboard");
        return "/tutor/dashboard";
      case "pending":
        // addDebugInfo("Tutor pending approval, redirecting to pending page");
        return "/tutor/pending";
      case "initial":
        // addDebugInfo("Tutor needs to complete onboarding");
        return "/tutor/pendingandinitial";
      case "rejected":
        // addDebugInfo("Tutor verification rejected");
        return "/tutor/rejected";
      default:
        // addDebugInfo(
        //   `Unknown verification status: ${tutor.verification_status}`
        // );
        return "/tutor/onboarding";
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setDebugInfo([]);
    // addDebugInfo("Starting login process...");

    try {
      // Step 1: Authenticate user
      // addDebugInfo("Authenticating user...");
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: values.email.trim(),
          password: values.password,
        }),
      });

      const responseData = await response.json();
      // addDebugInfo(`Login response: ${JSON.stringify(responseData, null, 2)}`);

      if (!response.ok) {
        let errorMessage = "Login failed. Please try again.";
        let debugMessage = `Login failed with status ${response.status}\n`;

        if (response.status === 400) {
          errorMessage =
            responseData.message || "Invalid request. Please check your input.";
          if (responseData.errors) {
            errorMessage = Object.values(responseData.errors).join("\n");
          }
        } else if (response.status === 401) {
          errorMessage = "The email or password you entered is incorrect.";
        } else if (response.status === 404) {
          errorMessage = "User not found. Please check your email or sign up.";
        }

        addDebugInfo(`Login error: ${errorMessage}`);
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

      // Step 3: Determine redirect path
      let redirectPath = "/";

      if (user.role === "admin") {
        redirectPath = "/admin/dashboard";
        // addDebugInfo("Admin user detected, redirecting to admin dashboard");
      } else if (user.role === "student") {
        redirectPath = "/student/dashboard";
        // addDebugInfo("Student user detected, redirecting to student dashboard");
      } else if (user.role === "tutor") {
        redirectPath = await handleTutorRedirect(token, user.email);
      } else {
        // addDebugInfo(`Unknown role ${user.role}, redirecting to home`);
      }

      // addDebugInfo(`Final redirect path: ${redirectPath}`);
      window.location.href = redirectPath;
    } catch (error) {
      const errorMessage = `Network Error: ${
        error instanceof Error ? error.message : String(error)
      }`;
      // addDebugInfo(errorMessage);
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
      {/* Toast Container */}
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

      {/* Debug Panel */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 left-4 z-[100] max-w-md rounded-md bg-gray-900 p-4 text-xs text-white opacity-90">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold"></h3>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  navigator.clipboard.writeText(debugInfo.join("\n"))
                }
                className="text-xs hover:text-blue-300"
              ></button>
              <button
                onClick={() => setDebugInfo([])}
                className="text-xs hover:text-red-300"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="max-h-40 overflow-y-auto font-mono">
            {debugInfo.length > 0 ? (
              debugInfo.map((line, i) => (
                <div key={i} className="mb-1 border-b border-gray-700 pb-1">
                  {line}
                </div>
              ))
            ) : (
              <p></p>
            )}
          </div>
        </div>
      )}

      <Link
        href="/"
        className="absolute left-4 top-4 flex items-center gap-2 md:left-8 md:top-8"
      >
        <BookOpen className="h-6 w-6" />
        <span className="font-bold">EduConnect</span>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>
            Enter your email and password to sign in to your account
          </CardDescription>
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
            <Link
              href="/auth/forgot-password"
              className="underline underline-offset-4 hover:text-primary"
            >
              Forgot password?
            </Link>
          </div>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
