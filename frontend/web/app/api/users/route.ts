import { NextResponse } from "next/server"
import { getSession } from "next-auth/react"

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Mock data - replace with your database logic
  const users = [
    {
      id: "user2@example.com",
      name: "John Doe",
      email: "user2@example.com",
      avatar: "",
    },
    {
      id: "user3@example.com",
      name: "Jane Smith",
      email: "user3@example.com",
      avatar: "",
    },
    {
      id: "user4@example.com",
      name: "Alice Johnson",
      email: "user4@example.com",
      avatar: "",
    },
  ]

  return NextResponse.json(users)
}