import { NextResponse } from "next/server"
import { getSession } from "next-auth/react"

export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Mock data - replace with your database logic
  const messages = [
    {
      id: "101",
      content: "Hello there!",
      senderId: "user2@example.com",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      isRead: true,
    },
    {
      id: "102",
      content: "Hi! How are you?",
      senderId: session.user?.email ?? "unknown",
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      isRead: true,
    },
    {
      id: "103",
      content: "I'm good, thanks for asking!",
      senderId: "user2@example.com",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isRead: true,
    },
  ]

  return NextResponse.json(messages)
}