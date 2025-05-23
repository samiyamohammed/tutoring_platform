"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { io, Socket } from "socket.io-client"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

type Notification = {
  _id: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/signin")
      return
    }

    const verifyAndLoadUser = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()
        setCurrentUser(data.user)

        const res = await fetch(`http://localhost:5000/api/notifications/${data.user._id}`)
        const notifs = await res.json()
        setNotifications(notifs.notifications || [])

        const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:5000", {
          auth: {
            Authorization: `Bearer ${token}`,
          },
          transports: ["websocket"],
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
        })

        setSocket(newSocket)

        newSocket.on("connect", () => {
          console.log("✅ Connected to socket server")
        })

        newSocket.on("disconnect", () => {
          console.log("❌ Disconnected from socket server")
        })

        newSocket.on("connect_error", (error: Error) => {
          console.error("Socket connection error:", error)
          if (error.message.includes("Authentication error")) {
            toast({
              title: "Session expired",
              description: "Please login again",
              variant: "destructive",
            })
            router.push("/auth/signin")
          }
        })

        newSocket.on("new-notification", (notification: Notification) => {
          setNotifications((prev) => [notification, ...prev])
        })

        return () => {
          newSocket.disconnect()
        }

      } catch (err) {
        console.error("Token verification or data load failed:", err)
        router.push("/auth/signin")
      }
    }

    verifyAndLoadUser()
  }, [router])

  const markAllAsRead = async () => {
    if (!currentUser) return
    try {
      await fetch("http://localhost:5000/api/notifications/markAsRead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: currentUser._id }),
      })

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
        }))
      )
    } catch (error) {
      console.error("Failed to mark notifications as read:", error)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <button
          onClick={markAllAsRead}
          className="text-sm bg-primary text-white px-3 py-1 rounded hover:bg-primary/90"
        >
          Mark All as Read
        </button>
      </div>

      {notifications.length === 0 ? (
        <p className="text-muted-foreground">No notifications.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n._id} className="p-4 relative">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">{n.title}</h3>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && <Badge className="absolute top-2 right-2 bg-red-500">New</Badge>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
