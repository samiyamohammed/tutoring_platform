"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Camera,
  CameraOff,
  Copy,
  Mic,
  MicOff,
  MonitorUp,
  Phone,
  PhoneOff,
  Users,
  Video,
  AlertTriangle,
} from "lucide-react"
import { io, Socket } from "socket.io-client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const chatSchema = z.object({
  message: z.string().min(1, { message: "Message cannot be empty" }),
})

type User = {
  _id: string
  name: string
  avatar?: string
  isTutor?: boolean
}

type Participant = {
  userId: string
  name: string
  avatar?: string
  isTutor: boolean
  isCameraOn: boolean
  isMicOn: boolean
  isScreenSharing: boolean
}

type Session = {
  _id: string
  course?: {
    name?: string
  }
  tutor?: User
  student?: User
  status?: string
}

type ChatMessage = {
  _id: string
  sender: string
  name: string
  isTutor: boolean
  content: string
  timestamp: Date
}

export default function VideoSessionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("id")
  const [socket, setSocket] = useState<Socket | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isJoined, setIsJoined] = useState(false)
  const [isMicOn, setIsMicOn] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isTutor, setIsTutor] = useState(false)
  const [showEndSessionDialog, setShowEndSessionDialog] = useState(false)
  const [showJoinDialog, setShowJoinDialog] = useState(true)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isCheckingDevices, setIsCheckingDevices] = useState(true)
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean | null>(null)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRefs = useRef<{ [userId: string]: HTMLVideoElement | null }>({})
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const peerConnections = useRef<{ [userId: string]: RTCPeerConnection }>({})
  const screenStreamRef = useRef<MediaStream | null>(null)

  const form = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: { message: "" }
  })
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
  // Initialize socket connection and verify user
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/signin')
      return
    }

    const loadUser = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/auth/verify`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to verify token')
        }

        const userData = await response.json()
        setCurrentUser(userData.user)
      } catch (error) {
        console.error('Failed to verify token:', error)
        localStorage.removeItem('token')
        router.push('/auth/signin')
      }
    }

    loadUser()

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || `${baseUrl}`, {
      auth: {
        Authorization: `Bearer ${token}`,
      },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    })

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err)
      toast.error( "Could not connect to the session server.",
      )
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [router, toast])

  // Socket event handlers
  useEffect(() => {
    if (!socket || !currentUser) return

    const handleSessionState = (data: {
      session: Session
      participants: Participant[]
      chatMessages: ChatMessage[]
      isTutor: boolean
    }) => {
      setSession(data.session)
      setParticipants(data.participants)
      setChatMessages(data.chatMessages)
      setIsTutor(data.isTutor)
    }

    const handleParticipantJoined = (data: {
      user: User & { isTutor: boolean }
    }) => {
      setParticipants(prev => [
        ...prev.filter(p => p.userId !== data.user._id),
        {
          userId: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar,
          isTutor: data.user.isTutor,
          isCameraOn: false,
          isMicOn: false,
          isScreenSharing: false
        }
      ])
    }

    const handleParticipantLeft = (data: { userId: string }) => {
      setParticipants(prev => prev.filter(p => p.userId !== data.userId))
      if (peerConnections.current[data.userId]) {
        peerConnections.current[data.userId].close()
        delete peerConnections.current[data.userId]
      }
    }

    const handleMediaUpdated = (data: {
      userId: string
      mediaType: 'camera' | 'mic' | 'screen'
      state: boolean
    }) => {
      setParticipants(prev => prev.map(p =>
        p.userId === data.userId ? {
          ...p,
          [data.mediaType === 'camera' ? 'isCameraOn' :
            data.mediaType === 'mic' ? 'isMicOn' : 'isScreenSharing']: data.state
        } : p
      ))
    }

    const handleReceiveSignal = async (data: {
      fromUserId: string
      signal: RTCSessionDescriptionInit
    }) => {
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" }
        ]
      })
      peerConnections.current[data.fromUserId] = peerConnection

      // Add our stream to connection
      if (mediaStreamRef.current) {
        if (mediaStreamRef.current) {
          if (mediaStreamRef.current) {
            if (mediaStreamRef.current) {
              mediaStreamRef.current.getTracks().forEach(track => {
                peerConnection.addTrack(track, mediaStreamRef.current!)
              })
            }
          }
        }
      }

      // Handle incoming tracks
      peerConnection.ontrack = (event) => {
        if (remoteVideoRefs.current[data.fromUserId]) {
          remoteVideoRefs.current[data.fromUserId]!.srcObject = event.streams[0]
        }
      }

      await peerConnection.setRemoteDescription(data.signal)
      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)
      socket.emit("return-signal", {
        sessionId,
        toUserId: data.fromUserId,
        signal: peerConnection.localDescription
      })
    }

    const handleReceiveReturnSignal = async (data: {
      fromUserId: string
      signal: RTCSessionDescriptionInit
    }) => {
      const peerConnection = peerConnections.current[data.fromUserId]
      if (peerConnection) {
        await peerConnection.setRemoteDescription(data.signal)
      }
    }

    const handleNewChatMessage = (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message])
    }

    const handleSessionEnded = () => {
      toast.message( "The tutor has ended the session.")
      handleLeaveSession()
    }

    socket.on("session-state", handleSessionState)
    socket.on("participant-joined", handleParticipantJoined)
    socket.on("participant-left", handleParticipantLeft)
    socket.on("media-updated", handleMediaUpdated)
    socket.on("receive-signal", handleReceiveSignal)
    socket.on("receive-return-signal", handleReceiveReturnSignal)
    socket.on("new-chat-message", handleNewChatMessage)
    socket.on("session-ended", handleSessionEnded)

    return () => {
      socket.off("session-state", handleSessionState)
      socket.off("participant-joined", handleParticipantJoined)
      socket.off("participant-left", handleParticipantLeft)
      socket.off("media-updated", handleMediaUpdated)
      socket.off("receive-signal", handleReceiveSignal)
      socket.off("receive-return-signal", handleReceiveReturnSignal)
      socket.off("new-chat-message", handleNewChatMessage)
      socket.off("session-ended", handleSessionEnded)
    }
  }, [socket, sessionId, toast, currentUser])

  // Initialize media devices
  useEffect(() => {
    async function checkDevicePermissions() {
      setIsCheckingDevices(true)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        setHasCameraPermission(true)
        setHasMicrophonePermission(true)
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
        mediaStreamRef.current = stream
        setCameraError(null)
      } catch (err) {
        console.error("Error accessing media devices:", err)
        setCameraError(err instanceof Error ? err.message : String(err))
        setHasCameraPermission(false)
        setHasMicrophonePermission(false)
      } finally {
        setIsCheckingDevices(false)
      }
    }

    checkDevicePermissions()

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Update media tracks when state changes
  useEffect(() => {
    if (isJoined && mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = isCameraOn
      })
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMicOn
      })
      if (isCameraOn && localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStreamRef.current
      }
      if (socket) {
        socket.emit("toggle-media", { sessionId, mediaType: 'camera', state: isCameraOn })
        socket.emit("toggle-media", { sessionId, mediaType: 'mic', state: isMicOn })
      }
    }
  }, [isJoined, isCameraOn, isMicOn, socket, sessionId])

  // Initialize peer connections when participants change
  useEffect(() => {
    if (!isJoined || !socket || !mediaStreamRef.current || !currentUser) return

    const initializePeerConnections = async () => {
      for (const participant of participants) {
        if (participant.userId === currentUser._id || peerConnections.current[participant.userId]) continue

        const peerConnection = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" }
          ]
        })
        peerConnections.current[participant.userId] = peerConnection

        // Add our stream to connection
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => {
            peerConnection.addTrack(track, mediaStreamRef.current!)
          })
        }

        // Handle incoming tracks
        peerConnection.ontrack = (event) => {
          if (remoteVideoRefs.current[participant.userId]) {
            remoteVideoRefs.current[participant.userId]!.srcObject = event.streams[0]
          }
        }

        // ICE candidate handling
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("send-signal", {
              sessionId,
              toUserId: participant.userId,
              signal: { type: "candidate", candidate: event.candidate }
            })
          }
        }

        // Create offer
        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)
        socket.emit("send-signal", {
          sessionId,
          toUserId: participant.userId,
          signal: peerConnection.localDescription
        })
      }
    }

    initializePeerConnections()
  }, [participants, isJoined, socket, sessionId, currentUser])

  const handleJoinSession = () => {
    if (!hasCameraPermission && !hasMicrophonePermission) {
      toast.message( "Camera or microphone access is required to join the session.",
      )
      return
    }

    if (!socket || !currentUser) {
      toast.error( "Not connected to session server.",
      )
      return
    }

    socket.emit("join-session", { sessionId })
    setIsJoined(true)
    setShowJoinDialog(false)
    setIsCameraOn(true)
    setIsMicOn(true)
  }

  const handleLeaveSession = () => {
    if (socket) {
      socket.emit("leave-session", { sessionId })
    }

    // Clean up media and connections
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop())
      screenStreamRef.current = null
    }

    Object.values(peerConnections.current).forEach(pc => pc.close())
    peerConnections.current = {}

    setIsJoined(false)
    setShowEndSessionDialog(false)
    router.push(isTutor ? "/tutor/dashboard" : "/student/dashboard")
  }

  const toggleMic = () => {
    const newState = !isMicOn
    setIsMicOn(newState)
    if (socket) {
      socket.emit("toggle-media", { sessionId, mediaType: 'mic', state: newState })
    }
  }

  const toggleCamera = () => {
    const newState = !isCameraOn
    setIsCameraOn(newState)
    if (socket) {
      socket.emit("toggle-media", { sessionId, mediaType: 'camera', state: newState })
    }
  }

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        })
        screenStreamRef.current = screenStream

        // Replace video track in all peer connections
        const screenTrack = screenStream.getVideoTracks()[0]
        Object.values(peerConnections.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video')
          if (sender) sender.replaceTrack(screenTrack)
        })

        // Update local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream
        }

        setIsScreenSharing(true)
        if (socket) {
          socket.emit("toggle-media", { sessionId, mediaType: 'screen', state: true })
        }

        // Handle when sharing is stopped
        screenTrack.onended = () => {
          toggleScreenShare()
        }
      } else {
        // Restore camera
        if (mediaStreamRef.current) {
          const cameraTrack = mediaStreamRef.current.getVideoTracks()[0]
          Object.values(peerConnections.current).forEach(pc => {
            const sender = pc.getSenders().find(s => s.track?.kind === 'video')
            if (sender) sender.replaceTrack(cameraTrack)
          })

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = mediaStreamRef.current
          }
        }

        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => track.stop())
          screenStreamRef.current = null
        }

        setIsScreenSharing(false)
        if (socket) {
          socket.emit("toggle-media", { sessionId, mediaType: 'screen', state: false })
        }
      }
    } catch (err) {
      console.error("Screen sharing error:", err)
      toast.error( "Could not share your screen. Please try again.",
      )
    }
  }

  const endSession = () => {
    if (socket) {
      socket.emit("end-session", { sessionId })
    }
    handleLeaveSession()
  }

  const copySessionLink = () => {
    const link = `${window.location.origin}/join-session?id=${sessionId}`
    navigator.clipboard.writeText(link)
    toast.success( "Session link copied to clipboard.",
    )
  }

  const onSubmitChat = (values: z.infer<typeof chatSchema>) => {
    if (socket) {
      socket.emit("send-chat-message", {
        sessionId,
        message: values.message
      })
      form.reset()
    }
  }

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  if (!isJoined && !showJoinDialog) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Session Ended</CardTitle>
            <CardDescription>You have left the video session.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push(isTutor ? "/tutor/dashboard" : "/student/dashboard")}>
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center space-x-2">
          <Video className="h-5 w-5" />
          <h1 className="text-lg font-semibold">
            {session?.course?.name || "Video Session"}
            {isTutor && <Badge variant="outline" className="ml-2">Tutor</Badge>}
          </h1>
          {currentUser && (
            <div className="flex items-center space-x-2 ml-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{currentUser.name}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={copySessionLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy session link</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {isTutor && (
            <Button variant="destructive" size="sm" onClick={() => setShowEndSessionDialog(true)}>
              <Phone className="mr-2 h-4 w-4" />
              End Session
            </Button>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video grid */}
        <div className="flex-1 overflow-auto p-4">
          {cameraError && isJoined && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Camera Error</AlertTitle>
              <AlertDescription>
                {cameraError}
                <Button variant="outline" size="sm" className="mt-2" onClick={handleJoinSession}>
                  Retry Camera Access
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Local video */}
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`h-full w-full object-cover ${!isCameraOn && !isScreenSharing && "hidden"}`}
              />
              {(!isCameraOn && !isScreenSharing) && (
                <div className="flex h-full w-full items-center justify-center">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Your avatar" />
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                </div>
              )}
              <div className="absolute bottom-2 left-2 flex items-center space-x-1 rounded-md bg-background/80 px-2 py-1 text-xs">
                <Badge variant={isScreenSharing ? "default" : "outline"} className="text-xs">
                  {isScreenSharing ? "Screen" : "Camera"}
                </Badge>
                <span>You</span>
                {isMicOn ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3 text-destructive" />}
              </div>
            </div>

            {/* Remote videos */}
            {participants.map((participant) => (
              <div key={participant.userId} className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                <video
                  ref={el => {
                    if (el) {
                      remoteVideoRefs.current[participant.userId] = el
                    }
                  }}
                  autoPlay
                  playsInline
                  className={`h-full w-full object-cover ${!participant.isCameraOn && !participant.isScreenSharing && "hidden"}`}
                />
                {(!participant.isCameraOn && !participant.isScreenSharing) && (
                  <div className="flex h-full w-full items-center justify-center">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={participant.avatar || "/placeholder.svg"} alt={participant.name} />
                      <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 flex items-center space-x-1 rounded-md bg-background/80 px-2 py-1 text-xs">
                  <Badge variant={participant.isTutor ? "default" : "outline"} className="text-xs">
                    {participant.isTutor ? "Tutor" : "Student"}
                  </Badge>
                  <span>{participant.name}</span>
                  {participant.isMicOn ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3 text-destructive" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden w-80 flex-shrink-0 border-l md:block">
          <Tabs defaultValue="participants">
            <TabsList className="w-full justify-start rounded-none border-b">
              <TabsTrigger value="participants" className="flex-1">
                <Users className="mr-2 h-4 w-4" />
                Participants ({participants.length + 1})
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex-1">
                Chat
              </TabsTrigger>
            </TabsList>
            <TabsContent value="participants" className="p-0">
              <div className="h-[calc(100vh-10rem)] overflow-y-auto">
                <div className="space-y-2 p-4">
                  {/* Current user */}
                  <div className="flex items-center justify-between rounded-md bg-muted/50 p-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg" alt="You" />
                        <AvatarFallback>You</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">You</div>
                        <Badge variant={isTutor ? "default" : "outline"} className="text-xs">
                          {isTutor ? "Tutor" : "Student"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4 text-destructive" />}
                      {isCameraOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4 text-destructive" />}
                    </div>
                  </div>

                  {/* Other participants */}
                  {participants.map((participant) => (
                    <div key={participant.userId} className="flex items-center justify-between rounded-md bg-muted/50 p-2">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.avatar || "/placeholder.svg"} alt={participant.name} />
                          <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{participant.name}</div>
                          <Badge variant={participant.isTutor ? "default" : "outline"} className="text-xs">
                            {participant.isTutor ? "Tutor" : "Student"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {participant.isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4 text-destructive" />}
                        {participant.isCameraOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4 text-destructive" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="chat" className="flex h-[calc(100vh-10rem)] flex-col p-0">
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {chatMessages.map((message) => (
                    <div key={message._id} className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{message.name}</span>
                        <Badge
                          variant={message.isTutor ? "default" : "outline"}
                          className="text-xs"
                        >
                          {message.isTutor ? "Tutor" : "Student"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="p-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitChat)} className="flex space-x-2">
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Type a message..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Send</Button>
                  </form>
                </Form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Controls */}
      <footer className="flex items-center justify-center space-x-4 border-t bg-muted/50 px-4 py-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isMicOn ? "outline" : "destructive"}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={toggleMic}
              >
                {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isMicOn ? "Mute microphone" : "Unmute microphone"}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isCameraOn ? "outline" : "destructive"}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={toggleCamera}
                disabled={!hasCameraPermission}
              >
                {isCameraOn ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isCameraOn ? "Turn off camera" : "Turn on camera"}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isScreenSharing ? "default" : "outline"}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={toggleScreenShare}
              >
                <MonitorUp className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isScreenSharing ? "Stop sharing" : "Share screen"}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={handleLeaveSession}
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Leave session</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </footer>

      {/* End Session Dialog */}
      <Dialog open={showEndSessionDialog} onOpenChange={setShowEndSessionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to end this session? All participants will be disconnected.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowEndSessionDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={endSession}>
              End Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Session Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Video Session</DialogTitle>
            <DialogDescription>
              You are about to join a video session. Please check your audio and video settings before joining.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {isCheckingDevices ? (
              <div className="flex h-[200px] items-center justify-center">
                <div className="text-center">
                  <div className="mb-2 text-sm">Checking camera and microphone...</div>
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              </div>
            ) : cameraError ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Camera Access Error</AlertTitle>
                <AlertDescription>
                  {cameraError}
                  <Button variant="outline" size="sm" className="mt-2" onClick={handleJoinSession}>
                    Try Anyway
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                {isCameraOn && hasCameraPermission ? (
                  <video ref={localVideoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Your avatar" />
                      <AvatarFallback>You</AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-center space-x-4">
              <Button
                variant={isMicOn ? "outline" : "destructive"}
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={toggleMic}
                disabled={!hasMicrophonePermission}
              >
                {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              <Button
                variant={isCameraOn ? "outline" : "destructive"}
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={toggleCamera}
                disabled={!hasCameraPermission}
              >
                {isCameraOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              onClick={handleJoinSession}
              disabled={isCheckingDevices}
            >
              Join Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}