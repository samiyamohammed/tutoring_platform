"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { io, Socket } from "socket.io-client"
import { format } from "date-fns"
import { Send, Users, Plus, MoreVertical, ArrowLeft, Search, X, ChevronDown, Edit, Trash2 } from "lucide-react"
import { debounce } from "lodash"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

interface User {
  _id: string
  name: string
  email: string
  avatar?: string
  status?: 'online' | 'offline'
}

interface Message {
  _id: string
  content: string
  sender: User
  room: string
  createdAt: Date
  readBy: string[]  // Changed from optional to required array
  reactions?: { user: User; emoji: string }[]
  edited?: boolean
  deleted?: boolean
}

interface ChatRoom {
  _id: string
  name: string
  isGroupChat: boolean
  members: User[]
  lastMessage?: Message
  unreadCounts?: Record<string, number>
  updatedAt?: Date
}

export default function MessagesPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [socket, setSocket] = useState<Socket | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({})
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/signin')
      return
    }

    const loadUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/verify', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const userData = await response.json()
        setCurrentUser(userData.user)
      } catch (error) {
        console.error('Failed to verify token:', error)
        router.push('/auth/signin')
      }
    }

    loadUser()

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:5000", {
      auth: {
        Authorization: `Bearer ${token}`,
      },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [router])

  // Socket event listeners
  useEffect(() => {
    if (!socket || !currentUser) return

    const handleConnect = () => {
      console.log('Connected to socket server')
    }

    const handleDisconnect = () => {
      console.log('Disconnected from socket server')
    }

    const handleConnectError = (error: Error) => {
      console.error('Socket connection error:', error)
      if (error.message === 'Authentication error') {
        toast({
          title: "Session expired",
          description: "Please login again",
          variant: "destructive",
        })
      }
    }

    const handleReceiveMessage = (message: Message) => {
      setRooms(prevRooms => {
        return prevRooms.map(room => {
          if (room._id === message.room) {
            // Update unread counts for all members except sender
            const newUnreadCounts = { ...room.unreadCounts }
            room.members.forEach(member => {
              if (member._id && message.sender._id && member._id !== message.sender._id) {
                newUnreadCounts[member._id] = (newUnreadCounts[member._id] || 0) + 1
              }
            })

            return {
              ...room,
              lastMessage: message,
              unreadCounts: newUnreadCounts,
              updatedAt: new Date()
            }
          }
          return room
        })
      })

      if (message.room === currentRoomId) {
        const isSent = message.sender._id === currentUser._id
        
        if (isSent) {
          // Update temporary message with real ID
          setMessages(prev => prev.map(msg =>
            msg._id === `temp-${message._id}` ? message : msg
          ))
        } else {
          // Add new message if not already present
          setMessages(prev => [...prev, message])
          // Mark as read immediately since user is viewing the chat
          markMessageAsRead(message._id)
        }
        
        scrollToBottom()
      }
    }

    const handleMessageUpdated = (message: Message) => {
      if (message.room === currentRoomId) {
        setMessages(prev => prev.map(msg =>
          msg._id === message._id ? { ...msg, ...message, edited: true } : msg
        ))
        
        // Update last message if this was the last message
        setRooms(prev => prev.map(room => {
          if (room._id === message.room && room.lastMessage?._id === message._id) {
            return { ...room, lastMessage: message }
          }
          return room
        }))
      }
    }

    const handleMessageDeleted = (messageId: string) => {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, content: 'This message has been deleted', deleted: true } : msg
      ))
      
      // Update last message if this was the last message
      setRooms(prev => prev.map(room => {
        if (room.lastMessage?._id === messageId) {
          return { 
            ...room, 
            lastMessage: { 
              ...room.lastMessage, 
              content: 'This message has been deleted',
              deleted: true 
            } 
          }
        }
        return room
      }))
    }

    const handleReactionAdded = (data: { messageId: string; reactions: { user: User; emoji: string }[] }) => {
      if (data.messageId) {
        setMessages(prev => prev.map(msg => 
          msg._id === data.messageId ? { ...msg, reactions: data.reactions } : msg
        ))
      }
    }

    const handleUserTyping = (data: { roomId: string; userId: string; name: string }) => {
      if (data.roomId === currentRoomId) {
        setTypingUsers(prev => ({ ...prev, [data.userId]: data.name }))

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUsers(prev => {
            const newTypingUsers = { ...prev }
            delete newTypingUsers[data.userId]
            return newTypingUsers
          })
        }, 3000)
      }
    }

    const handleUserStoppedTyping = (data: { roomId: string; userId: string }) => {
      if (data.roomId === currentRoomId) {
        setTypingUsers(prev => {
          const newTypingUsers = { ...prev }
          delete newTypingUsers[data.userId]
          return newTypingUsers
        })
      }
    }

    const handleNewChatCreated = (newChat: ChatRoom) => {
      setRooms(prev => [...prev, newChat])
    }

    const handleUnreadCountsUpdated = (data: { roomId: string; userId: string; count: number }) => {
      setRooms(prev => prev.map(room => {
        if (room._id === data.roomId) {
          const unreadCounts = { ...room.unreadCounts }
          unreadCounts[data.userId] = data.count
          return { ...room, unreadCounts }
        }
        return room
      }))
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)
    socket.on('receive-message', handleReceiveMessage)
    socket.on('messageUpdated', handleMessageUpdated)
    socket.on('messageDeleted', handleMessageDeleted)
    socket.on('reactionAdded', handleReactionAdded)
    socket.on('userTyping', handleUserTyping)
    socket.on('userStoppedTyping', handleUserStoppedTyping)
    socket.on('new-chat-created', handleNewChatCreated)
    socket.on('unreadCountsUpdated', handleUnreadCountsUpdated)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)
      socket.off('receive-message', handleReceiveMessage)
      socket.off('messageUpdated', handleMessageUpdated)
      socket.off('messageDeleted', handleMessageDeleted)
      socket.off('reactionAdded', handleReactionAdded)
      socket.off('userTyping', handleUserTyping)
      socket.off('userStoppedTyping', handleUserStoppedTyping)
      socket.off('new-chat-created', handleNewChatCreated)
      socket.off('unreadCountsUpdated', handleUnreadCountsUpdated)
    }
  }, [socket, currentRoomId, currentUser, toast])

  // Load initial data
  useEffect(() => {
    if (!currentUser) return

    const loadInitialData = async () => {
      try {
        setIsLoading(true)
        await Promise.all([loadChatRooms(), loadUsers()])
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [currentUser, toast])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token')
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (response.status === 401) {
      throw new Error('Session expired. Please login again.')
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Request failed')
    }

    return response
  }

  const loadChatRooms = async () => {
    try {
      const response = await fetchWithAuth('http://localhost:5000/api/chat')
      const roomsData = await response.json()
      setRooms(roomsData)

      if (socket) {
        socket.emit('joinRooms')
      }

      if (roomsData.length > 0 && !currentRoomId) {
        selectChatRoom(roomsData[0]._id)
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error)
      throw error
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetchWithAuth('http://localhost:5000/api/users')
      const usersData = await response.json()
      setUsers(usersData)
    } catch (error) {
      console.error('Error loading users:', error)
      throw error
    }
  }

  const loadMessages = async (roomId: string) => {
    try {
      const response = await fetchWithAuth(`http://localhost:5000/api/chat/${roomId}/messages`)
      const messagesData = await response.json()
      // Reverse the messages to show newest at bottom
      setMessages(messagesData.reverse())
      scrollToBottom()
    } catch (error) {
      console.error('Error loading messages:', error)
      throw error
    }
  }

  const markMessageAsRead = async (messageId: string) => {
  if (!currentRoomId || !currentUser) return
  
  try {
    await fetchWithAuth(`http://localhost:5000/api/chat/${currentRoomId}/messages/read`, {
      method: 'POST',
      body: JSON.stringify({ messageIds: [messageId] })
    })

    setMessages(prev => prev.map(msg => {
      if (msg._id === messageId) {
        // Ensure readBy is an array before spreading
        const currentReadBy = Array.isArray(msg.readBy) ? msg.readBy : []
        return { 
          ...msg, 
          readBy: [...currentReadBy, currentUser._id] 
        }
      }
      return msg
    }))
  } catch (error) {
    console.error('Error marking message as read:', error)
  }
}

  const markMessagesAsRead = async (roomId: string) => {
    if (!currentUser) return
    
    try {
      const unreadMessageIds = messages
        .filter(msg => msg.room === roomId && !msg.readBy.includes(currentUser._id))
        .map(msg => msg._id)

      if (unreadMessageIds.length > 0) {
        await fetchWithAuth(`http://localhost:5000/api/chat/${roomId}/messages/read`, {
          method: 'POST',
          body: JSON.stringify({ messageIds: unreadMessageIds })
        })

        setRooms(prev => prev.map(room => {
          if (room._id === roomId) {
            const unreadCounts = { ...room.unreadCounts }
            unreadCounts[currentUser._id] = 0
            return { ...room, unreadCounts }
          }
          return room
        }))
      }
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const selectChatRoom = async (roomId: string) => {
    setCurrentRoomId(roomId)
    await loadMessages(roomId)
    await markMessagesAsRead(roomId)
  }

  const sendMessage = async () => {
    const content = messageInput.trim()
    if (!content || !currentRoomId || !socket || !currentUser) return

    // If editing a message
    if (editingMessageId) {
      try {
        setIsSending(true)
        await fetchWithAuth(`http://localhost:5000/api/messages/${editingMessageId}`, {
          method: 'PUT',
          body: JSON.stringify({ content })
        })

        socket.emit('updateMessage', {
          messageId: editingMessageId,
          content
        })

        setEditingMessageId(null)
        setMessageInput('')
      } catch (error) {
        console.error('Error updating message:', error)
        toast({
          title: "Error",
          description: "Failed to update message",
          variant: "destructive",
        })
      } finally {
        setIsSending(false)
      }
      return
    }

    // For new messages
    const tempId = `temp-${Date.now()}`

    try {
      setIsSending(true)

      const tempMessage: Message = {
        _id: tempId,
        content,
        sender: currentUser,
        room: currentRoomId,
        createdAt: new Date(),
        readBy: [currentUser._id]
      }

      setMessages(prev => [...prev, tempMessage])
      setMessageInput('')

      socket.emit('send-message', {
        roomId: currentRoomId,
        content: content,
        tempId: tempId
      })

      scrollToBottom()

    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })

      setMessages(prev => prev.filter(msg => msg._id !== tempId))
    } finally {
      setIsSending(false)
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      await fetchWithAuth(`http://localhost:5000/api/messages/${messageId}`, {
        method: 'DELETE'
      })

      if (socket) {
        socket.emit('deleteMessage', messageId)
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      })
    }
  }

  const startEditingMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId)
    setMessageInput(content)
  }

  const cancelEditing = () => {
    setEditingMessageId(null)
    setMessageInput('')
  }

  const createNewChat = async (participantId: string) => {
    try {
      const response = await fetchWithAuth('http://localhost:5000/api/chat/private/' + participantId, {
        method: 'POST'
      })

      const newChat = await response.json()
      if (socket) {
        socket.emit('new-chat-created', newChat)
      }
      setShowNewChatModal(false)
      selectChatRoom(newChat._id)
    } catch (error) {
      console.error('Error creating chat:', error)
      toast({
        title: "Error",
        description: "Failed to create chat",
        variant: "destructive",
      })
    }
  }

  const createGroupChat = async (participantIds: string[], groupName: string) => {
    try {
      const response = await fetchWithAuth('http://localhost:5000/api/chat/group', {
        method: 'POST',
        body: JSON.stringify({
          participantIds,
          name: groupName
        })
      })

      const newChat = await response.json()
      if (socket) {
        socket.emit('new-chat-created', newChat)
      }
      setShowNewChatModal(false)
      selectChatRoom(newChat._id)
    } catch (error) {
      console.error('Error creating group chat:', error)
      toast({
        title: "Error",
        description: "Failed to create group chat",
        variant: "destructive",
      })
    }
  }

  const handleTyping = useCallback(debounce(() => {
    if (currentRoomId && socket) {
      socket.emit('typing', currentRoomId)
    }
  }, 500), [currentRoomId, socket])

  const handleStopTyping = useCallback(debounce(() => {
    if (currentRoomId && socket) {
      socket.emit('stopTyping', currentRoomId)
    }
  }, 1000), [currentRoomId, socket])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesContainerRef.current?.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }, 100)
  }

  const formatTime = (date: Date) => {
    return format(new Date(date), 'h:mm a')
  }

  const getRoomName = (room: ChatRoom) => {
    if (room.isGroupChat) {
      return room.name
    }
    const otherParticipant = room.members.find(member => member._id !== currentUser?._id)
    return otherParticipant?.name || 'Private Chat'
  }

  const getRoomAvatarText = (room: ChatRoom) => {
    const name = getRoomName(room)
    return name.charAt(0).toUpperCase()
  }

  const getUnreadCount = (room: ChatRoom) => {
    if (!currentUser) return 0
    return room.unreadCounts?.[currentUser._id] || 0
  }

  const currentRoom = rooms.find(room => room._id === currentRoomId)

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h1 className="text-xl font-bold">Messages</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNewChatModal(true)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search messages"
              className="pl-10"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        {/* Chats list */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="space-y-3 p-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-3 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center text-muted p-3">No chat rooms available</div>
          ) : (
            rooms
              .sort((a, b) => 
                new Date(
                  (b.lastMessage?.createdAt ?? b.updatedAt ?? 0)
                ).getTime() -
                new Date(
                  (a.lastMessage?.createdAt ?? a.updatedAt ?? 0)
                ).getTime()
              )
              .filter(room => 
                getRoomName(room).toLowerCase().includes(searchInput.toLowerCase())
              )
              .map(room => (
                <div
                  key={room._id}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer flex items-center ${
                    currentRoomId === room._id ? "bg-gray-100" : ""
                  }`}
                  onClick={() => selectChatRoom(room._id)}
                >
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white mr-3">
                      {getRoomAvatarText(room)}
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">
                        {getRoomName(room)}
                      </h3>
                      {room.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatTime(room.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {room.lastMessage?.content || "No messages yet"}
                    </p>
                  </div>
                  {getUnreadCount(room) > 0 && (
                    <Badge className="ml-2">
                      {getUnreadCount(room)}
                    </Badge>
                  )}
                </div>
              ))
          )}
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b flex justify-between items-center bg-white">
              <div className="flex items-center">
                <div className="flex items-center">
                  {currentRoom.isGroupChat ? (
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white mr-3">
                      {getRoomAvatarText(currentRoom)}
                    </div>
                  ) : (
                    <div className="relative">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage
                          src={
                            currentRoom.members.find(
                              member => member._id !== currentUser?._id
                            )?.avatar
                          }
                        />
                        <AvatarFallback>
                          {getRoomName(currentRoom).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                        currentRoom.members.find(
                          member => member._id !== currentUser?._id
                        )?.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                  )}
                  <div>
                    <h2 className="font-bold">
                      {getRoomName(currentRoom)}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {Object.values(typingUsers).length > 0 ? (
                        <span className="text-blue-500">
                          {Object.values(typingUsers).join(", ")} typing...
                        </span>
                      ) : currentRoom.isGroupChat ? (
                        `${currentRoom.members.length} members`
                      ) : (
                        currentRoom.members.find(
                          member => member._id !== currentUser?._id
                        )?.status === 'online' ? 'Online' : 'Offline'
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {currentRoom.isGroupChat && (
                    <>
                      <DropdownMenuItem>Add members</DropdownMenuItem>
                      <DropdownMenuItem>Group info</DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem>View profile</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    Delete chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Messages */}
            <ScrollArea 
              className="flex-1 p-4 bg-gray-50"
              ref={messagesContainerRef}
            >
              <div className="flex flex-col space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted">No messages yet</div>
                ) : (
                  messages.map((message) => {
                    const isSent = message.sender._id === currentUser?._id
                    const isEdited = message.edited
                    const isDeleted = message.deleted
                    
                    return (
                      <div 
                        key={message._id}
                        className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                      >
                        <div className="max-w-xs md:max-w-md">
                          <div className={`rounded-lg px-4 py-2 ${
                            isSent ? "bg-blue-500 text-white" : "bg-white"
                          }`}>
                            {!isSent && (
                              <p className="text-xs font-medium mb-1">
                                {message.sender.name}
                              </p>
                            )}
                            <p className={isDeleted ? "italic text-gray-500" : ""}>
                              {message.content}
                            </p>
                            <div className="flex justify-between items-center mt-1">
                              <p className={`text-xs ${
                                isSent ? "text-blue-100" : "text-gray-500"
                              }`}>
                                {formatTime(message.createdAt)}
                                {isEdited && " (edited)"}
                              </p>
                              {(message.reactions?.length ?? 0) > 0 && (
                                <div className="flex space-x-1">
                                  {message.reactions?.map((reaction, i) => (
                                    <span
                                      key={i}
                                      className="text-xs bg-white bg-opacity-20 rounded-full px-1"
                                    >
                                      {reaction.emoji}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          {isSent && !isDeleted && (
                            <div className="flex justify-end mt-1 space-x-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                  >
                                    <ChevronDown className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => startEditingMessage(message._id, message.content)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => deleteMessage(message._id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center gap-2">
                {editingMessageId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelEditing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <div className="relative flex-1">
                  <Textarea
                    placeholder={editingMessageId ? "Edit your message..." : "Type a message"}
                    className="min-h-[40px] resize-none pr-10"
                    rows={1}
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value)
                      if (e.target.value) {
                        handleTyping()
                      } else {
                        handleStopTyping()
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                  />
                </div>
                <Button 
                  onClick={sendMessage}
                  disabled={isSending || !messageInput.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                Select a chat to start messaging
              </h3>
              <p className="mt-1 text-gray-500">
                Or start a new conversation
              </p>
              <Button
                className="mt-4"
                onClick={() => setShowNewChatModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* New chat modal */}
      <Dialog
        open={showNewChatModal}
        onOpenChange={setShowNewChatModal}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search users"
                className="pl-10"
              />
            </div>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    const participantIds = users
                      .filter((user) => user._id !== currentUser?._id)
                      .slice(0, 3)
                      .map((user) => user._id)
                    createGroupChat(participantIds, "New Group")
                  }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Create Group Chat
                </Button>
                {users
                  .filter((user) => user._id !== currentUser?._id)
                  .map((user) => (
                    <div
                      key={user._id}
                      className="p-3 hover:bg-gray-50 cursor-pointer flex items-center"
                      onClick={() => createNewChat(user._id)}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                          user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}