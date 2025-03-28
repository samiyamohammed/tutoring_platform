"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { User, AtSign, KeyRound, BookOpen, Briefcase, Loader2 } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

const RegisterForm = ({ onRegister }) => {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("student")
  const [tutorFields, setTutorFields] = useState({
    specialty: "",
    experience: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    // Basic validation
    if (!fullName || !email || !password) {
      setError("Please fill in all required fields.")
      return
    }

    if (role === "tutor" && (!tutorFields.specialty || !tutorFields.experience)) {
      setError("Please complete your tutor profile.")
      return
    }

    setIsLoading(true)

    // Create user data object
    const userData = {
      fullName,
      email,
      password,
      role,
      ...(role === "tutor" && tutorFields),
    }

    // Simulate API call delay
    setTimeout(() => {
      try {
        // Simulate registration (replace with API call in real app)
        onRegister(userData)
        navigate(`/${role}/dashboard`) // Redirect to the respective dashboard
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Registration failed. Please try again.")
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
          <CardTitle className="text-2xl font-semibold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">Enter your details to register for EduConnect</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-50 text-red-600 border-red-200">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-base font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="pl-10 bg-gray-200 border-green-800/30 focus:bg-gray-100 text-cyan-900 focus-visible:ring-emerald-800/30"
                />
              </div>
            </div>

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
              <Label htmlFor="password" className="text-base font-medium">
                Password
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-gray-200 border-green-800/30 focus:bg-gray-100 text-cyan-900 focus-visible:ring-emerald-800/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-base font-medium">
                Register as
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger
                  id="role"
                  className="bg-gray-200 border-green-800/30 focus:bg-gray-100 text-cyan-900 focus-visible:ring-emerald-800/30"
                >
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">
                    <div className="flex items-center">
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>Student</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="tutor">
                    <div className="flex items-center">
                      <Briefcase className="mr-2 h-4 w-4" />
                      <span>Tutor</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role === "tutor" && (
              <div className="space-y-4 rounded-md bg-gray-50 p-4 border border-gray-200">
                <h3 className="font-medium text-gray-700">Tutor Profile</h3>

                <div className="space-y-2">
                  <Label htmlFor="tutor-specialty" className="text-base font-medium">
                    Specialty
                  </Label>
                  <Input
                    id="tutor-specialty"
                    type="text"
                    placeholder="E.g., Mathematics, Physics, Programming"
                    value={tutorFields.specialty}
                    onChange={(e) => setTutorFields({ ...tutorFields, specialty: e.target.value })}
                    className="bg-white border-green-800/30 focus:bg-gray-100 text-cyan-900 focus-visible:ring-emerald-800/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tutor-experience" className="text-base font-medium">
                    Years of Experience
                  </Label>
                  <Input
                    id="tutor-experience"
                    type="number"
                    min="0"
                    placeholder="Years of teaching experience"
                    value={tutorFields.experience}
                    onChange={(e) => setTutorFields({ ...tutorFields, experience: e.target.value })}
                    className="bg-white border-green-800/30 focus:bg-gray-100 text-cyan-900 focus-visible:ring-emerald-800/30"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-base py-5"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Separator className="bg-gray-200" />
          <div className="text-center w-full">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/login" className="font-medium text-blue-700 hover:text-blue-800 transition-colors">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default RegisterForm































// import {useState} from 'react'
// import { Link } from 'react-router-dom'

// const RegisterForm = ({ onRegister }) => {

//     const [fullName, setFullName] = useState('');
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [role, setRole] = useState('student');
//     const [tutorFields, setTutorFields] = useState({
//     specialty: '',
//     experience: '',
//     });

//     const handleSubmit = (e) => {
//         e.preventDefault();
    
//         if (role === 'tutor' && (!tutorFields.specialty || !tutorFields.experience)) {
//           alert('Please complete your tutor profile.');
//           return;
//         }
    
//         const userData = {
//           fullName,
//           email,
//           password,
//           role,
//           ...(role === 'tutor' && tutorFields),
//         };
    
//         onRegister(userData);
//       };
    

//   return (
//     <div className='bg-white h-screen flex flex-col justify-center items-center min-h-screen'>
//         <div className="text-center mb-8">
//             <h1 className="mt-4 text-5xl font-bold mb-5">EduConnect</h1>
//             <p className="mt-2 text-3xl font-semibold">Your Online Tutoring Platform</p>
//         </div>
        
//       <form action="" onSubmit={handleSubmit} className='w-full max-w-lg mb-2'>
//         <div className='mb-4'>
//             <label htmlFor="" className='block text-xl font-light mb-2'>Full Name</label>
//             <input type="text" className='block text-lg border w-full rounded-md py-1 px-6 outline-none border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100' placeholder='Email address' value={fullName}
//             onChange={(e) => setFullName(e.target.value)}
//             required/>
//         </div>
//         <div className='mb-4'>
//             <label htmlFor="" className='block text-xl font-light mb-2'>Email</label>
//             <input type="email" className='block text-lg border w-full rounded-md py-1 px-6 outline-none border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100' placeholder='Email address' value={email}
//           onChange={(e) => setEmail(e.target.value)}
// required/>
//         </div>
//         <div className='mb-4'>
//             <label htmlFor="" className='block text-xl font-light mb-2'>Password</label>
//             <input type="password" className='block text-lg border w-full rounded-md py-1 px-6 outline-none border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100' placeholder='Password' value={password}
//           onChange={(e) => setPassword(e.target.value)}
// required/>
//         </div>
//         <div class="mb-4">
//             <label htmlFor="" className='block text-xl font-light mb-2'>Register as</label>
//             <select className="appearance-none text-lg border w-full rounded-md py-1 px-6 outline-none border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100" value={role}
//           onChange={(e) => setRole(e.target.value)}>
//                 <option value="student">Student</option>
//                 <option value="tutor">Tutor</option>
//             </select>
//         </div>
//         {role === 'tutor' && (
//         <div className="mb-4">
//           <div className="mb-4">
//             <label htmlFor="tutor-specialty" className='block text-xl font-light mb-2'>
//               Specialty
//             </label>
//             <input
//               id="tutor-specialty"
//               type="text"
//               value={tutorFields.specialty}
//               onChange={(e) => setTutorFields({ ...tutorFields, specialty: e.target.value })}
//               className="appearance-none text-lg border w-full rounded-md py-1 px-6 outline-none border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100"
//               placeholder="E.g., Mathematics, Physics, Programming"
//             />
//           </div>
//           <div className="mb-4">
//             <label htmlFor="tutor-experience" className='block text-xl font-light mb-2'>
//               Years of Experience
//             </label>
//             <input
//               id="tutor-experience"
//               type="number"
//               min="0"
//               value={tutorFields.experience}
//               onChange={(e) => setTutorFields({ ...tutorFields, experience: e.target.value })}
//               className="appearance-none text-lg border w-full rounded-md py-1 px-6 outline-none border-green-800 text-cyan-900 bg-gray-200 focus:bg-gray-100"
//               placeholder="Years of teaching experience"
//             />
//           </div>
//         </div>
//       )}
//         <div className="mb-4">
//             <button type='submit' className="bg-emerald-800 text-white w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ">
//                 Register
//             </button>
//         </div>
//       </form>
//       <div className='flex text-base gap-2'>
//         <h2>Already have an account?</h2>
//         <Link to='/login' className='underline text-blue-700 text-lg -mt-1'>Login</Link>
//       </div>
//     </div>
//   )
// }

// export default RegisterForm
