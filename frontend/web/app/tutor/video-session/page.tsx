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

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Mock data for participants
const mockParticipants = [
  {
    id: "1",
    name: "John Doe",
    role: "tutor",
    avatar: "/placeholder.svg?height=40&width=40",
    isConnected: true,
    isSpeaking: false,
  },
  {
    id: "2",
    name: "Jane Smith",
    role: "student",
    avatar: "/placeholder.svg?height=40&width=40",
    isConnected: true,
    isSpeaking: false,
  },
  {
    id: "3",
    name: "Michael Brown",
    role: "student",
    avatar: "/placeholder.svg?height=40&width=40",
    isConnected: true,
    isSpeaking: false,
  },
  {
    id: "4",
    name: "Sarah Johnson",
    role: "student",
    avatar: "/placeholder.svg?height=40&width=40",
    isConnected: false,
    isSpeaking: false,
  },
]

const chatSchema = z.object({
  message: z.string().min(1, { message: "Message cannot be empty" }),
})

export default function VideoSessionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("id") || "demo-session"
  const sessionType = searchParams.get("type") || "group"
  const { toast } = useToast()

  const [isJoined, setIsJoined] = useState(false)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [participants, setParticipants] = useState(mockParticipants)
  const [chatMessages, setChatMessages] = useState([
    {
      id: "1",
      sender: "John Doe",
      role: "tutor",
      message: "Welcome to the session! We'll be covering advanced JavaScript concepts today.",
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: "2",
      sender: "Jane Smith",
      role: "student",
      message: "I'm excited to learn about promises and async/await!",
      timestamp: new Date(Date.now() - 240000),
    },
    {
      id: "3",
      sender: "Michael Brown",
      role: "student",
      message: "Will we be covering error handling as well?",
      timestamp: new Date(Date.now() - 180000),
    },
    {
      id: "4",
      sender: "John Doe",
      role: "tutor",
      message: "Yes, we'll definitely cover error handling with try/catch and promise rejection.",
      timestamp: new Date(Date.now() - 120000),
    },
  ])
  const [showEndSessionDialog, setShowEndSessionDialog] = useState(false)
  const [showJoinDialog, setShowJoinDialog] = useState(true)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isCheckingDevices, setIsCheckingDevices] = useState(true)
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean | null>(null)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({})
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  const form = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: {
      message: "",
    },
  })

  // Check for device permissions before joining
  useEffect(() => {
    async function checkDevicePermissions() {
      setIsCheckingDevices(true)
      try {
        // Check if the browser supports mediaDevices
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraError("Your browser doesn't support camera access. Please try a different browser.")
          setHasCameraPermission(false)
          setHasMicrophonePermission(false)
          return
        }

        // Try to access camera and microphone
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })

        // If successful, set permissions to true
        setHasCameraPermission(true)
        setHasMicrophonePermission(true)

        // Display preview in join dialog
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        // Store the stream for later use
        mediaStreamRef.current = stream
        setCameraError(null)
      } catch (err: any) {
        console.error("Error accessing media devices:", err)

        // Handle specific permission errors
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setCameraError("Camera or microphone permission denied. Please allow access in your browser settings.")
          setHasCameraPermission(false)
          setHasMicrophonePermission(false)
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setCameraError("No camera or microphone found. Please connect a device and try again.")
          setHasCameraPermission(false)
          setHasMicrophonePermission(false)
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          setCameraError("Your camera or microphone is already in use by another application.")
          setHasCameraPermission(false)
          setHasMicrophonePermission(false)
        } else {
          setCameraError(`Error accessing camera: ${err.message || "Unknown error"}`)
          setHasCameraPermission(false)
          setHasMicrophonePermission(false)
        }
      } finally {
        setIsCheckingDevices(false)
      }
    }

    checkDevicePermissions()

    return () => {
      // Clean up the media stream when component unmounts
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Update video stream when camera state changes
  useEffect(() => {
    if (isJoined && mediaStreamRef.current && localVideoRef.current) {
      // If we already have a stream, update track enabled states
      mediaStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isCameraOn
      })

      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMicOn
      })

      // Make sure the video element has the stream
      if (localVideoRef.current.srcObject !== mediaStreamRef.current) {
        localVideoRef.current.srcObject = mediaStreamRef.current
      }
    }
  }, [isJoined, isCameraOn, isMicOn])

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatMessages])

  // Simulate random participant speaking
  useEffect(() => {
    if (!isJoined) return

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * participants.length)
      setParticipants((prev) =>
        prev.map((p, i) => ({
          ...p,
          isSpeaking: i === randomIndex && p.isConnected,
        })),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [isJoined, participants])

  const handleJoinSession = () => {
    if (!hasCameraPermission && !hasMicrophonePermission) {
      toast({
        variant: "destructive",
        title: "Permission required",
        description: "Camera or microphone access is required to join the session.",
      })
      return
    }

    setIsJoined(true)
    setShowJoinDialog(false)
    toast({
      title: "Joined session",
      description: `You have joined the ${sessionType} session.`,
    })
  }

  const handleLeaveSession = () => {
    // Clean up video streams
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }

    setIsJoined(false)
    setShowEndSessionDialog(false)
    router.push("/tutor/dashboard")
  }

  const toggleMic = () => {
    setIsMicOn(!isMicOn)
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isMicOn
      })
    }
  }

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn)
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !isCameraOn
      })
    }
  }

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        // Stop current video track if it exists
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getVideoTracks().forEach((track) => track.stop())
        }

        // Get screen sharing stream
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })

        // If we have an existing stream, add the screen track to it
        if (mediaStreamRef.current) {
          // Remove old video tracks
          const audioTracks = mediaStreamRef.current.getAudioTracks()

          // Create a new stream with audio from camera and video from screen
          const newStream = new MediaStream()

          // Add audio tracks from the original stream
          audioTracks.forEach((track) => newStream.addTrack(track))

          // Add video track from screen sharing
          newStream.addTrack(screenStream.getVideoTracks()[0])

          // Replace the stream
          mediaStreamRef.current = newStream

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = newStream
          }
        } else {
          // If no existing stream, just use the screen stream
          mediaStreamRef.current = screenStream
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = screenStream
          }
        }

        // Listen for the end of screen sharing
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false)
          // Restore camera
          restoreCamera()
        }

        setIsScreenSharing(true)
      } catch (err) {
        console.error("Error sharing screen:", err)
        toast({
          variant: "destructive",
          title: "Screen sharing error",
          description: "Could not share your screen. Please try again.",
        })
      }
    } else {
      // Stop screen sharing and restore camera
      restoreCamera()
      setIsScreenSharing(false)
    }
  }

  const restoreCamera = async () => {
    try {
      // Stop current tracks
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getVideoTracks().forEach((track) => track.stop())
      }

      // Get new camera stream if camera is on
      if (isCameraOn) {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: isMicOn,
        })

        // If we have an existing stream with audio, keep that audio
        if (mediaStreamRef.current && mediaStreamRef.current.getAudioTracks().length > 0) {
          const audioTracks = mediaStreamRef.current.getAudioTracks()

          // Add the audio tracks to the new stream
          audioTracks.forEach((track) => {
            if (!newStream.getAudioTracks().includes(track)) {
              newStream.addTrack(track)
            }
          })
        }

        mediaStreamRef.current = newStream

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = newStream
        }
      }
    } catch (err) {
      console.error("Error restoring camera:", err)
      setCameraError("Failed to restore camera after screen sharing.")
      setIsCameraOn(false)
    }
  }

  const copySessionLink = () => {
    const link = `${window.location.origin}/join-session?id=${sessionId}`
    navigator.clipboard.writeText(link)
    toast({
      title: "Link copied",
      description: "Session link copied to clipboard.",
    })
  }

  const onSubmitChat = (values: z.infer<typeof chatSchema>) => {
    const newMessage = {
      id: Date.now().toString(),
      sender: "John Doe", // Current user
      role: "tutor",
      message: values.message,
      timestamp: new Date(),
    }
    setChatMessages([...chatMessages, newMessage])
    form.reset()
  }

  const retryCamera = async () => {
    setCameraError(null)
    setIsCheckingDevices(true)

    try {
      // Request permissions again
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      setHasCameraPermission(true)
      setHasMicrophonePermission(true)

      // Update the stream
      mediaStreamRef.current = stream

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      setIsCameraOn(true)
      setIsMicOn(true)
    } catch (err: any) {
      console.error("Error retrying camera access:", err)
      setCameraError(`Could not access camera: ${err.message || "Unknown error"}`)
      setHasCameraPermission(false)
    } finally {
      setIsCheckingDevices(false)
    }
  }

  if (!isJoined && !showJoinDialog) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Session Ended</CardTitle>
            <CardDescription>You have left the video session.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/tutor/dashboard")}>
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
          <h1 className="text-lg font-semibold">{sessionType === "group" ? "Group Session" : "One-on-One Session"}</h1>
          <Badge variant="outline" className="ml-2">
            {sessionId}
          </Badge>
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
          <Button variant="destructive" size="sm" onClick={() => setShowEndSessionDialog(true)}>
            <Phone className="mr-2 h-4 w-4" />
            End Session
          </Button>
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
                <Button variant="outline" size="sm" className="mt-2" onClick={retryCamera}>
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
                className={`h-full w-full object-cover ${!isCameraOn && "hidden"}`}
              />
              {(!isCameraOn || cameraError) && (
                <div className="flex h-full w-full items-center justify-center">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Your avatar" />
                    <AvatarFallback>JD</AvatarFallback>
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
            {participants
              .filter((p) => p.id !== "1" && p.isConnected) // Filter out local user and disconnected users
              .map((participant) => (
                <div key={participant.id} className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                  <div className="flex h-full w-full items-center justify-center">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={participant.avatar || "/placeholder.svg"} alt={participant.name} />
                      <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div
                    className={`absolute inset-0 border-2 transition-colors ${
                      participant.isSpeaking ? "border-primary" : "border-transparent"
                    }`}
                  ></div>
                  <div className="absolute bottom-2 left-2 flex items-center space-x-1 rounded-md bg-background/80 px-2 py-1 text-xs">
                    <Badge variant="outline" className="text-xs">
                      {participant.role}
                    </Badge>
                    <span>{participant.name}</span>
                    <Mic className="h-3 w-3" />
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
                Participants ({participants.filter((p) => p.isConnected).length})
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex-1">
                Chat
              </TabsTrigger>
            </TabsList>
            <TabsContent value="participants" className="p-0">
              <div className="h-[calc(100vh-10rem)] overflow-y-auto">
                <div className="space-y-2 p-4">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className={`flex items-center justify-between rounded-md p-2 ${
                        participant.isConnected ? "bg-muted/50" : "bg-muted/20 opacity-50"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.avatar || "/placeholder.svg"} alt={participant.name} />
                          <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium">{participant.name}</span>
                            {participant.isSpeaking && (
                              <Badge variant="outline" className="ml-2 bg-primary/10 text-xs">
                                Speaking
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <Badge
                              variant="outline"
                              className={`text-xs ${participant.role === "tutor" ? "bg-primary/10" : "bg-muted"}`}
                            >
                              {participant.role}
                            </Badge>
                            {!participant.isConnected && (
                              <span className="text-xs text-muted-foreground">Disconnected</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Mic className="h-4 w-4 text-muted-foreground" />
                        <Camera className="h-4 w-4 text-muted-foreground" />
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
                    <div key={message.id} className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{message.sender}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${message.role === "tutor" ? "bg-primary/10" : "bg-muted"}`}
                        >
                          {message.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
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
                onClick={() => setShowEndSessionDialog(true)}
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>End session</TooltipContent>
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
            <Button variant="destructive" onClick={handleLeaveSession}>
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
              You are about to join a {sessionType === "group" ? "group" : "one-on-one"} session. Please check your
              audio and video settings before joining.
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
                  <Button variant="outline" size="sm" className="mt-2" onClick={retryCamera}>
                    Retry Camera Access
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
                      <AvatarFallback>JD</AvatarFallback>
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
              disabled={isCheckingDevices || (!hasCameraPermission && !hasMicrophonePermission)}
            >
              Join Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
