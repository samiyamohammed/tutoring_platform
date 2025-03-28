"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AtSign, KeyRound, Loader2 } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    // Basic validation
    if (!email || !password) {
      setError("Please fill in all fields.")
      return
    }

    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      // Simulate login (replace with API call in real app)
      if (email === "student@example.com" && password === "student123") {
        onLogin(email, "student")
        navigate("/student/dashboard") // Redirect to student dashboard
      } else if (email === "tutor@example.com" && password === "tutor123") {
        onLogin(email, "tutor")
        navigate("/tutor/dashboard") // Redirect to tutor dashboard
      } else if (email === "admin@example.com" && password === "admin123") {
        onLogin(email, "admin")
        navigate("/admin/dashboard") // Redirect to admin dashboard
      } else {
        setError("Invalid email or password.")
        setIsLoading(false)
      }
    }, 1000)
  }

  return (
    <div className="w-full max-w-md px-4">
      <div className="text-center mb-6">
        <h1 className="text-5xl font-bold text-emerald-800 mb-2">EduConnect</h1>
        <p className="text-xl text-gray-600">Your Online Tutoring Platform</p>
      </div>

      <Card className="border-emerald-800/20 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold text-center">Sign in</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-50 text-red-600 border-red-200">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium">
                Email
              </Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-gray-200 border-green-800/30 focus:bg-gray-100 text-cyan-900 focus-visible:ring-emerald-800/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-base font-medium">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-gray-200 border-green-800/30 focus:bg-gray-100 text-cyan-900 focus-visible:ring-emerald-800/30"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                className="border-green-800/50 data-[state=checked]:bg-emerald-800 data-[state=checked]:text-white"
              />
              <Label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-base py-5"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Separator className="bg-gray-200" />
          <div className="text-center w-full">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/register" className="font-medium text-blue-700 hover:text-blue-800 transition-colors">
              Register
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default LoginForm

























// import {useState} from 'react'
// import { Link } from 'react-router-dom'

// const LoginForm = ({ onLogin }) => {

//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         onLogin(email, password);
//     };

//   return (
//     <div className='bg-white h-screen flex flex-col justify-center items-center min-h-screen'>
//         <div className="text-center mb-8">
//             <h1 className="mt-4 text-5xl font-bold mb-5">EduConnect</h1>
//             <p className="mt-2 text-3xl font-semibold">Your Online Tutoring Platform</p>
//         </div>
//       <form action="" onSubmit={handleSubmit} className='w-full max-w-lg mb-2'>
//       <div className='mb-4'>
//             <label htmlFor="" className='block text-xl font-light mb-2'>Email</label>
//             <input type="email" className='block text-lg border w-full rounded-md py-1 px-6 outline-none border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100' placeholder='Email address' />
//         </div>
//         <div className='mb-4'>
//             <label htmlFor="" className='block text-xl font-light mb-2'>Password</label>
//             <input type="password" className='block text-lg border w-full rounded-md py-1 px-6 outline-none border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100' placeholder='Password'/>
//         </div>
//         <div className="flex items-center justify-between mb-10">
//             <div className="flex items-center">
//                 <input type="checkbox" className="size-5 rounded bg-white"/>
//                 <label htmlFor="" className="ml-2 block text-base">Remember me</label>
//             </div>
//             <Link className="text-base font-medium text-blue-700 underline">Forgot password?</Link>
//         </div>
//         <div className="mb-4">
//             <button className="bg-emerald-800 text-white w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ">
//                 Sign in
//             </button>
//         </div>
//       </form>
//       <div className='flex text-base gap-2'>
//         <h2>Don't have an account?</h2>
//         <Link to='/register' className='underline text-blue-700 text-lg -mt-1'>Register</Link>
//       </div>
//     </div>
//   )
// }

// export default LoginForm
