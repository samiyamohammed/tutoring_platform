"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Camera, CameraOff, Hand, Mic, MicOff, Phone, PhoneOff, Users, Video } from "lucide-react"

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

// Mock data for participants
const mockParticipants = [
  {
    id: "1",
    name: "John Smith",
    role: "tutor",
    avatar: "/placeholder.svg?height=40&width=40",
    isConnected: true,
    isSpeaking: false,
  },
  {
    id: "2",
    name: "Jane Doe",
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
]

const chatSchema = z.object({
  message: z.string().min(1, { message: "Message cannot be empty" }),
})

export default function StudentVideoSessionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("id") || "demo-session"
  const sessionType = searchParams.get("type") || "group"
  const { toast } = useToast()

  const [isJoined, setIsJoined] = useState(false)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isHandRaised, setIsHandRaised] = useState(false)
  const [participants, setParticipants] = useState(mockParticipants)
  const [chatMessages, setChatMessages] = useState([
    {
      id: "1",
      sender: "John Smith",
      role: "tutor",
      message: "Welcome to the session! We'll be covering advanced JavaScript concepts today.",
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: "2",
      sender: "Jane Doe",
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
      sender: "John Smith",
      role: "tutor",
      message: "Yes, we'll definitely cover error handling with try/catch and promise rejection.",
      timestamp: new Date(Date.now() - 120000),
    },
  ])
  const [showLeaveSessionDialog, setShowLeaveSessionDialog] = useState(false)
  const [showJoinDialog, setShowJoinDialog] = useState(true)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({})
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const form = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: {
      message: "",
    },
  })

  // Simulate getting local video stream
  useEffect(() => {
    if (isJoined && isCameraOn && localVideoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: isMicOn })
        .then((stream) => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream
          }
        })
        .catch((err) => {
          console.error("Error accessing media devices:", err)
          toast({
            variant: "destructive",
            title: "Camera access error",
            description: "Could not access your camera or microphone.",
          })
          setIsCameraOn(false)
        })
    }

    return () => {
      // Clean up streams when component unmounts
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isJoined, isCameraOn, isMicOn, toast])

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
    setIsJoined(true)
    setShowJoinDialog(false)
    toast({
      title: "Joined session",
      description: `You have joined the ${sessionType} session.`,
    })
  }

  const handleLeaveSession = () => {
    // Clean up video streams
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }

    setIsJoined(false)
    setShowLeaveSessionDialog(false)
    router.push("/student/dashboard")
  }

  const toggleMic = () => {
    setIsMicOn(!isMicOn)
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !isMicOn
      })
    }
  }

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn)
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !isCameraOn
      })
    }
  }

  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised)
    toast({
      title: isHandRaised ? "Hand lowered" : "Hand raised",
      description: isHandRaised
        ? "Your hand has been lowered."
        : "Your hand has been raised. The tutor will see your request.",
    })
  }

  const onSubmitChat = (values: z.infer<typeof chatSchema>) => {
    const newMessage = {
      id: Date.now().toString(),
      sender: "Jane Doe", // Current user
      role: "student",
      message: values.message,
      timestamp: new Date(),
    }
    setChatMessages([...chatMessages, newMessage])
    form.reset()
  }

  if (!isJoined && !showJoinDialog) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Session Left</CardTitle>
            <CardDescription>You have left the video session.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/student/dashboard")}>
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
        <Button variant="destructive" size="sm" onClick={() => setShowLeaveSessionDialog(true)}>
          <Phone className="mr-2 h-4 w-4" />
          Leave Session
        </Button>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video grid */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Tutor video (always first and larger) */}
            <div className="relative col-span-full aspect-video overflow-hidden rounded-lg bg-muted md:col-span-2">
              <div className="flex h-full w-full items-center justify-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={participants[0].avatar || "/placeholder.svg"} alt={participants[0].name} />
                  <AvatarFallback>{participants[0].name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <div
                className={`absolute inset-0 border-2 transition-colors ${
                  participants[0].isSpeaking ? "border-primary" : "border-transparent"
                }`}
              ></div>
              <div className="absolute bottom-2 left-2 flex items-center space-x-1 rounded-md bg-background/80 px-2 py-1 text-xs">
                <Badge variant="default" className="text-xs">
                  Tutor
                </Badge>
                <span>{participants[0].name}</span>
                <Mic className="h-3 w-3" />
              </div>
            </div>

            {/* Local video */}
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`h-full w-full object-cover ${!isCameraOn && "hidden"}`}
              />
              {!isCameraOn && (
                <div className="flex h-full w-full items-center justify-center">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Your avatar" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </div>
              )}
              <div className="absolute bottom-2 left-2 flex items-center space-x-1 rounded-md bg-background/80 px-2 py-1 text-xs">
                <Badge variant="outline" className="text-xs">
                  You
                </Badge>
                {isMicOn ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3 text-destructive" />}
                {isHandRaised && <Hand className="h-3 w-3 text-yellow-500" />}
              </div>
            </div>

            {/* Other students */}
            {participants
              .filter((p) => p.id !== "1" && p.id !== "2") // Filter out tutor and local user
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
                      Student
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
          <Tabs defaultValue="chat">
            <TabsList className="w-full justify-start rounded-none border-b">
              <TabsTrigger value="participants" className="flex-1">
                <Users className="mr-2 h-4 w-4" />
                Participants ({participants.length})
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
                          <Badge
                            variant="outline"
                            className={`text-xs ${participant.role === "tutor" ? "bg-primary/10" : "bg-muted"}`}
                          >
                            {participant.role}
                          </Badge>
                        </div>
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
                variant={isHandRaised ? "default" : "outline"}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={toggleHandRaise}
              >
                <Hand className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isHandRaised ? "Lower hand" : "Raise hand"}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={() => setShowLeaveSessionDialog(true)}
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Leave session</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </footer>

      {/* Leave Session Dialog */}
      <Dialog open={showLeaveSessionDialog} onOpenChange={setShowLeaveSessionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave this session? You can rejoin later if the session is still active.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowLeaveSessionDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLeaveSession}>
              Leave Session
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
              You are about to join a {sessionType === "group" ? "group" : "one-on-one"} session with{" "}
              {participants[0].name}. Please check your audio and video settings before joining.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video overflow-hidden rounded-lg bg-muted">
              {isCameraOn ? (
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
            <div className="flex justify-center space-x-4">
              <Button
                variant={isMicOn ? "outline" : "destructive"}
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={toggleMic}
              >
                {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              <Button
                variant={isCameraOn ? "outline" : "destructive"}
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={toggleCamera}
              >
                {isCameraOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button onClick={handleJoinSession}>Join Session</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
