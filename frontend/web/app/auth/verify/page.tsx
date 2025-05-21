"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { BookOpen, CheckCircle, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [timeLeft, setTimeLeft] = useState(60)

  const email = searchParams.get("email") || ""

  useEffect(() => {
    if (timeLeft > 0 && !isVerified) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft, isVerified])

  const handleResendCode = async () => {
  setIsLoading(true);

  try {
    const response = await fetch("http://localhost:5000/api/auth/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to resend verification code.");
    }

    toast({
      title: "Verification code resent",
      description: "Please check your email for the new code.",
    });

    setTimeLeft(60);
  } catch (error: any) {
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Failed to resend verification code. Please try again.",
    });
  } finally {
    setIsLoading(false);
  }
};

 const handleVerify = async () => {
  if (!verificationCode) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Please enter the verification code.",
    });
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch("http://localhost:5000/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: verificationCode }),
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.message === "OTP expired") {
        toast({
          variant: "destructive",
          title: "Code Expired",
          description: "Your verification code has expired. Please resend the code.",
        });
        return;
      }

      throw new Error(result.message || "Invalid verification code.");
    }

    setIsVerified(true);

    toast({
      title: "Email verified!",
      description: "Your email has been successfully verified.",
    });

    setTimeout(() => {
      router.push("/auth/signin");
    }, 2000);
  } catch (error: any) {
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message || "Invalid verification code. Please try again.",
    });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link href="/" className="absolute left-4 top-4 flex items-center gap-2 md:left-8 md:top-8">
        <BookOpen className="h-6 w-6" />
        <span className="font-bold">EduConnect</span>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>
            {isVerified
              ? "Your email has been verified successfully."
              : `We've sent a verification code to ${email || "your email"}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isVerified ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-center text-lg font-medium">Email verified successfully!</p>
              <p className="text-center text-sm text-muted-foreground">
                You will be redirected to your dashboard shortly.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Mail className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <Button onClick={handleVerify} className="w-full" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify Email"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        {!isVerified && (
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Didn&apos;t receive a code?{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={handleResendCode}
                disabled={timeLeft > 0 || isLoading}
              >
                {timeLeft > 0 ? `Resend code (${timeLeft}s)` : "Resend code"}
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
