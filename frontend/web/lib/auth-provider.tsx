"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: "student" | "tutor" | "admin"
  isVerified: boolean
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (userData: Omit<User, "id" | "isVerified"> & { password: string }) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        // This would be replaced with actual API call
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Failed to restore auth state:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // This would be replaced with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user data based on email
      let role: "student" | "tutor" | "admin" = "student"
      if (email.includes("admin")) {
        role = "admin"
      } else if (email.includes("tutor")) {
        role = "tutor"
      }

      const userData: User = {
        id: Math.random().toString(36).substring(2, 9),
        firstName: "John",
        lastName: "Doe",
        email,
        role,
        isVerified: true,
      }

      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (userData: Omit<User, "id" | "isVerified"> & { password: string }) => {
    setIsLoading(true)
    try {
      // This would be replaced with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user creation
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
        isVerified: false,
      }

      // Don't set user yet - they need to verify email first
      localStorage.setItem("pendingUser", JSON.stringify(newUser))
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
