// "use client"

// import { useEffect, useRef, useState, useCallback } from "react"
// import { useRouter } from "next/navigation"
// import { useSession } from "next-auth/react"
// import { Send, Users, Plus, MoreVertical, ArrowLeft, Search, X, Smile, Paperclip, ChevronDown } from "lucide-react"
// import { io, Socket } from "socket.io-client"
// import { v4 as uuidv4 } from "uuid"
// import useChat from "@/hooks/useChat"
// import { formatDistanceToNow, format } from "date-fns"
// import { debounce } from "lodash"

// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Badge } from "@/components/ui/badge"
// import { useToast } from "@/components/ui/use-toast"
// import EmojiPicker from "@/components/emoji-picker"
// import { Textarea } from "@/components/ui/textarea"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { Skeleton } from "@/components/ui/skeleton"

// interface User {
//   id: string
//   name: string
//   email: string
//   avatar?: string
//   status?: 'online' | 'offline'
// }

// interface Attachment {
//   type: 'image' | 'video' | 'file' | 'audio'
//   url: string
//   name?: string
//   size?: number
// }

// interface Message {
//   id: string
//   content: string
//   sender: User
//   roomId: string
//   timestamp: Date
//   readBy: string[]
//   attachments?: Attachment[]
//   replyTo?: Message
//   reactions?: { user: User; emoji: string }[]
//   edited?: boolean
// }

// interface Chat {
//   id: string
//   name: string
//   participants: User[]
//   isGroup: boolean
//   lastMessage?: Message
//   unreadCount: number
//   admins?: string[]
//   createdBy?: string
// }

// export default function MessagesPage() {
//   const router = useRouter()
//   const { data: session } = useSession()
//   const { toast } = useToast()
//   const {
//     socket,
//     isConnected,
//     typingUsers,
//     emitTyping,
//     emitStopTyping
//   } = useChat()
  
//   const [chats, setChats] = useState<Chat[]>([])
//   const [activeChat, setActiveChat] = useState<Chat | null>(null)
//   const [messages, setMessages] = useState<Message[]>([])
//   const [messageInput, setMessageInput] = useState("")
//   const [searchInput, setSearchInput] = useState("")
//   const [users, setUsers] = useState<User[]>([])
//   const [showNewChatModal, setShowNewChatModal] = useState(false)
//   const [isLoading, setIsLoading] = useState(true)
//   const [isSending, setIsSending] = useState(false)
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false)
//   const [replyMessage, setReplyMessage] = useState<Message | null>(null)
//   const [page, setPage] = useState(1)
//   const [hasMore, setHasMore] = useState(true)
//   const messagesEndRef = useRef<HTMLDivElement>(null)
//   const messagesContainerRef = useRef<HTMLDivElement>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)
//   const [attachments, setAttachments] = useState<Attachment[]>([])

//   // Initialize data
//   useEffect(() => {
//     if (!session?.user?.email) return

//     const loadData = async () => {
//       try {
//         setIsLoading(true)
//         await Promise.all([fetchChats(), fetchUsers()])
//       } catch (error) {
//         toast({
//           title: "Error",
//           description: "Failed to load data",
//           variant: "destructive",
//         })
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     loadData()
//   }, [session])

//   // Socket event listeners
//   useEffect(() => {
//     if (!socket) return

//     const handleNewMessage = (message: Message) => {
//       if (message.roomId === activeChat?.id) {
//         setMessages(prev => [message, ...prev])
//         markMessagesAsRead([message.id])
//       }

//       // Update last message in chats list
//       setChats(prevChats =>
//         prevChats.map(chat =>
//           chat.id === message.roomId
//             ? { ...chat, lastMessage: message, unreadCount: 0 }
//             : chat.id === activeChat?.id
//               ? chat
//               : { ...chat, unreadCount: chat.unreadCount + 1 }
//         )
//       )
//     }

//     const handleMessageUpdated = (message: Message) => {
//       setMessages(prev =>
//         prev.map(msg => (msg.id === message.id ? message : msg))
//     }

//     const handleMessageDeleted = (messageId: string) => {
//       setMessages(prev =>
//         prev.map(msg =>
//           msg.id === messageId
//             ? { ...msg, content: "This message has been deleted", deleted: true }
//             : msg
//         )
//     }

//     const handleReactionAdded = ({
//       messageId,
//       reactions
//     }: {
//       messageId: string
//       reactions: { user: User; emoji: string }[]
//     }) => {
//       setMessages(prev =>
//         prev.map(msg =>
//           msg.id === messageId ? { ...msg, reactions } : msg
//         )
//       )
//     }

//     socket.on("newMessage", handleNewMessage)
//     socket.on("messageUpdated", handleMessageUpdated)
//     socket.on("messageDeleted", handleMessageDeleted)
//     socket.on("reactionAdded", handleReactionAdded)

//     return () => {
//       socket.off("newMessage", handleNewMessage)
//       socket.off("messageUpdated", handleMessageUpdated)
//       socket.off("messageDeleted", handleMessageDeleted)
//       socket.off("reactionAdded", handleReactionAdded)
//     }
//   }, [socket, activeChat])

//   // Scroll to bottom when messages change
//   useEffect(() => {
//     if (messages.length > 0 && page === 1) {
//       scrollToBottom()
//     }
//   }, [messages, page])

//   const fetchChats = async () => {
//     try {
//       const response = await fetch("/api/chats")
//       const data = await response.json()
//       setChats(data)
//       if (data.length > 0 && !activeChat) {
//         setActiveChat(data[0])
//         fetchMessages(data[0].id)
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to load chats",
//         variant: "destructive",
//       })
//     }
//   }

//   const fetchMessages = async (chatId: string, loadMore = false) => {
//     try {
//       const currentPage = loadMore ? page + 1 : 1
//       const response = await fetch(
//         `/api/chats/${chatId}/messages?page=${currentPage}&limit=20`
//       )
//       const data = await response.json()

//       if (data.length === 0) {
//         setHasMore(false)
//         return
//       }

//       if (loadMore) {
//         setMessages(prev => [...data, ...prev])
//         setPage(currentPage)
//       } else {
//         setMessages(data)
//         setPage(1)
//         setHasMore(true)
//       }

//       // Mark messages as read
//       if (data.length > 0 && !loadMore) {
//         const unreadMessages = data
//           .filter((msg: Message) => !msg.readBy.includes(session?.user?.email || ""))
//           .map((msg: Message) => msg.id)
        
//         if (unreadMessages.length > 0) {
//           markMessagesAsRead(unreadMessages)
//         }
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to load messages",
//         variant: "destructive",
//       })
//     }
//   }

//   const fetchUsers = async () => {
//     try {
//       const response = await fetch("/api/users")
//       const data = await response.json()
//       setUsers(data)
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to load users",
//         variant: "destructive",
//       })
//     }
//   }

//   const markMessagesAsRead = async (messageIds: string[]) => {
//     if (!activeChat || messageIds.length === 0) return

//     try {
//       await fetch(`/api/chats/${activeChat.id}/read`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ messageIds }),
//       })

//       // Update read status locally
//       setMessages(prev =>
//         prev.map(msg =>
//           messageIds.includes(msg.id)
//             ? {
//                 ...msg,
//                 readBy: [...new Set([...msg.readBy, session?.user?.email || ""])],
//               }
//             : msg
//         )
//       )

//       // Update unread count in chats list
//       setChats(prev =>
//         prev.map(chat =>
//           chat.id === activeChat.id ? { ...chat, unreadCount: 0 } : chat
//         )
//       )
//     } catch (error) {
//       console.error("Failed to mark messages as read:", error)
//     }
//   }

//   const handleSendMessage = async () => {
//     if ((!messageInput.trim() && attachments.length === 0) || !activeChat || !socket) return

//     setIsSending(true)
//     try {
//       // Upload attachments first if any
//       let uploadedAttachments: Attachment[] = []
//       if (attachments.length > 0) {
//         const formData = new FormData()
//         attachments.forEach(file => {
//           formData.append("files", file)
//         })

//         const uploadResponse = await fetch("/api/upload", {
//           method: "POST",
//           body: formData,
//         })
//         uploadedAttachments = await uploadResponse.json()
//       }

//       const newMessage = {
//         roomId: activeChat.id,
//         content: messageInput,
//         attachments: uploadedAttachments,
//         replyTo: replyMessage?.id,
//       }

//       const response = await fetch("/api/messages", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(newMessage),
//       })

//       if (!response.ok) throw new Error("Failed to send message")

//       // Reset input and attachments
//       setMessageInput("")
//       setAttachments([])
//       setReplyMessage(null)
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to send message",
//         variant: "destructive",
//       })
//     } finally {
//       setIsSending(false)
//     }
//   }

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const files = Array.from(e.target.files).map(file => ({
//         type: file.type.split("/")[0] as 'image' | 'video' | 'audio',
//         file,
//         preview: URL.createObjectURL(file),
//         name: file.name,
//         size: file.size,
//       }))
//       setAttachments(prev => [...prev, ...files])
//     }
//   }

//   const removeAttachment = (index: number) => {
//     setAttachments(prev => prev.filter((_, i) => i !== index))
//   }

//   const createNewChat = async (participantId: string) => {
//     try {
//       const response = await fetch("/api/chats", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           participantIds: [participantId],
//         }),
//       })

//       if (!response.ok) throw new Error("Failed to create chat")

//       const newChat = await response.json()
//       setActiveChat(newChat)
//       setMessages([])
//       setShowNewChatModal(false)
//       fetchChats() // Refresh chat list
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to create chat",
//         variant: "destructive",
//       })
//     }
//   }

//   const createGroupChat = async (participantIds: string[], groupName: string) => {
//     try {
//       const response = await fetch("/api/chats", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           participantIds,
//           isGroup: true,
//           name: groupName,
//         }),
//       })

//       if (!response.ok) throw new Error("Failed to create group chat")

//       const newChat = await response.json()
//       setActiveChat(newChat)
//       setMessages([])
//       setShowNewChatModal(false)
//       fetchChats() // Refresh chat list
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to create group chat",
//         variant: "destructive",
//       })
//     }
//   }

//   const handleTyping = debounce(() => {
//     if (activeChat) {
//       emitTyping(activeChat.id)
//     }
//   }, 500)

//   const handleStopTyping = debounce(() => {
//     if (activeChat) {
//       emitStopTyping(activeChat.id)
//     }
//   }, 1000)

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
//   }

//   const loadMoreMessages = () => {
//     if (activeChat && hasMore) {
//       fetchMessages(activeChat.id, true)
//     }
//   }

//   const handleScroll = () => {
//     if (messagesContainerRef.current) {
//       const { scrollTop } = messagesContainerRef.current
//       if (scrollTop === 0 && hasMore) {
//         loadMoreMessages()
//       }
//     }
//   }

//   const formatTime = (date: Date) => {
//     return format(new Date(date), "h:mm a")
//   }

//   const formatMessageDate = (date: Date) => {
//     return format(new Date(date), "MMMM d, yyyy")
//   }

//   const handleAddReaction = async (messageId: string, emoji: string) => {
//     if (!socket) return

//     try {
//       await fetch(`/api/messages/${messageId}/reactions`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ emoji }),
//       })
//     } catch (error) {
//       console.error("Failed to add reaction:", error)
//     }
//   }

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <div className="w-80 border-r bg-white flex flex-col">
//         <div className="p-4 border-b flex justify-between items-center">
//           <h1 className="text-xl font-bold">Messages</h1>
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => setShowNewChatModal(true)}
//           >
//             <Plus className="h-5 w-5" />
//           </Button>
//         </div>

//         {/* Search */}
//         <div className="p-3">
//           <div className="relative">
//             <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
//             <Input
//               placeholder="Search messages"
//               className="pl-10"
//               value={searchInput}
//               onChange={(e) => setSearchInput(e.target.value)}
//             />
//           </div>
//         </div>

//         {/* Chats list */}
//         <ScrollArea className="flex-1">
//           {isLoading ? (
//             <div className="space-y-3 p-3">
//               {Array.from({ length: 5 }).map((_, i) => (
//                 <div key={i} className="flex items-center space-x-3 p-2">
//                   <Skeleton className="h-10 w-10 rounded-full" />
//                   <div className="space-y-1">
//                     <Skeleton className="h-4 w-[120px]" />
//                     <Skeleton className="h-3 w-[200px]" />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             chats
//               .filter((chat) =>
//                 chat.name.toLowerCase().includes(searchInput.toLowerCase())
//               )
//               .map((chat) => (
//                 <div
//                   key={chat.id}
//                   className={`p-3 border-b hover:bg-gray-50 cursor-pointer flex items-center ${
//                     activeChat?.id === chat.id ? "bg-blue-50" : ""
//                   }`}
//                   onClick={() => {
//                     setActiveChat(chat)
//                     fetchMessages(chat.id)
//                   }}
//                 >
//                   <div className="relative">
//                     {chat.isGroup ? (
//                       <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
//                         <Users className="h-5 w-5 text-gray-600" />
//                       </div>
//                     ) : (
//                       <Avatar className="h-10 w-10">
//                         <AvatarImage
//                           src={
//                             chat.participants.find(
//                               (p) => p.id !== session?.user?.email
//                             )?.avatar || ""
//                           }
//                         />
//                         <AvatarFallback>
//                           {chat.participants
//                             .find((p) => p.id !== session?.user?.email)
//                             ?.name?.charAt(0) || "U"}
//                         </AvatarFallback>
//                       </Avatar>
//                     )}
//                     {chat.unreadCount > 0 && (
//                       <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
//                         {chat.unreadCount}
//                       </Badge>
//                     )}
//                   </div>
//                   <div className="ml-3 flex-1">
//                     <div className="flex justify-between items-center">
//                       <h3 className="font-medium">
//                         {chat.isGroup
//                           ? chat.name
//                           : chat.participants.find(
//                               (p) => p.id !== session?.user?.email
//                             )?.name || "Unknown"}
//                       </h3>
//                       {chat.lastMessage && (
//                         <span className="text-xs text-gray-500">
//                           {formatTime(chat.lastMessage.timestamp)}
//                         </span>
//                       )}
//                     </div>
//                     <p className="text-sm text-gray-500 truncate">
//                       {chat.lastMessage?.content || "No messages yet"}
//                     </p>
//                   </div>
//                 </div>
//               ))
//           )}
//         </ScrollArea>
//       </div>

//       {/* Chat area */}
//       <div className="flex-1 flex flex-col">
//         {activeChat ? (
//           <>
//             {/* Chat header */}
//             <div className="p-4 border-b flex justify-between items-center bg-white">
//               <div className="flex items-center">
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="md:hidden mr-2"
//                   onClick={() => setActiveChat(null)}
//                 >
//                   <ArrowLeft className="h-5 w-5" />
//                 </Button>
//                 {activeChat.isGroup ? (
//                   <div className="flex items-center">
//                     <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
//                       <Users className="h-5 w-5 text-gray-600" />
//                     </div>
//                     <div>
//                       <h2 className="font-bold">{activeChat.name}</h2>
//                       <p className="text-sm text-gray-500">
//                         {activeChat.participants.length} members
//                         {Object.keys(typingUsers).length > 0 && (
//                           <span className="ml-2 text-blue-500">
//                             {Object.values(typingUsers).join(", ")} typing...
//                           </span>
//                         )}
//                       </p>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="flex items-center">
//                     <div className="relative">
//                       <Avatar className="h-10 w-10 mr-3">
//                         <AvatarImage
//                           src={
//                             activeChat.participants.find(
//                               (p) => p.id !== session?.user?.email
//                             )?.avatar || ""
//                           }
//                         />
//                         <AvatarFallback>
//                           {activeChat.participants
//                             .find((p) => p.id !== session?.user?.email)
//                             ?.name?.charAt(0) || "U"}
//                         </AvatarFallback>
//                       </Avatar>
//                       <div className={`absolute bottom-0 right-2 h-3 w-3 rounded-full border-2 border-white ${
//                         activeChat.participants.find(
//                           (p) => p.id !== session?.user?.email
//                         )?.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
//                       }`} />
//                     </div>
//                     <div>
//                       <h2 className="font-bold">
//                         {activeChat.participants.find(
//                           (p) => p.id !== session?.user?.email
//                         )?.name || "Unknown"}
//                       </h2>
//                       <p className="text-sm text-gray-500">
//                         {activeChat.participants.find(
//                           (p) => p.id !== session?.user?.email
//                         )?.status === 'online' ? 'Online' : 'Offline'}
//                         {Object.keys(typingUsers).length > 0 && (
//                           <span className="ml-2 text-blue-500">typing...</span>
//                         )}
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="ghost" size="icon">
//                     <MoreVertical className="h-5 w-5" />
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent>
//                   {activeChat.isGroup && (
//                     <>
//                       <DropdownMenuItem>Add members</DropdownMenuItem>
//                       <DropdownMenuItem>Group info</DropdownMenuItem>
//                     </>
//                   )}
//                   <DropdownMenuItem>View profile</DropdownMenuItem>
//                   <DropdownMenuItem className="text-red-600">
//                     Delete chat
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>

//             {/* Messages */}
//             <ScrollArea 
//               className="flex-1 p-4 bg-gray-50"
//               ref={messagesContainerRef}
//               onScroll={handleScroll}
//             >
//               <div className="flex flex-col-reverse space-y-4 space-y-reverse">
//                 {isLoading ? (
//                   <div className="space-y-4">
//                     {Array.from({ length: 5 }).map((_, i) => (
//                       <div 
//                         key={i} 
//                         className={`flex ${
//                           i % 2 === 0 ? 'justify-end' : 'justify-start'
//                         }`}
//                       >
//                         <Skeleton className="h-12 w-64 rounded-lg" />
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <>
//                     {hasMore && (
//                       <div className="flex justify-center">
//                         <Button 
//                           variant="ghost" 
//                           size="sm"
//                           onClick={loadMoreMessages}
//                         >
//                           Load more messages
//                         </Button>
//                       </div>
//                     )}
//                     {messages.map((message, index) => {
//                       const isCurrentUser = message.sender.id === session?.user?.email
//                       const showDate = index === messages.length - 1 || 
//                         formatMessageDate(message.timestamp) !== formatMessageDate(messages[index + 1].timestamp)
                      
//                       return (
//                         <div key={message.id} className="space-y-2">
//                           {showDate && (
//                             <div className="flex justify-center">
//                               <div className="bg-gray-200 px-3 py-1 rounded-full text-xs text-gray-600">
//                                 {formatMessageDate(message.timestamp)}
//                               </div>
//                             </div>
//                           )}
//                           <div
//                             className={`flex ${
//                               isCurrentUser ? "justify-end" : "justify-start"
//                             }`}
//                           >
//                             <div className="max-w-xs md:max-w-md lg:max-w-lg">
//                               {message.replyTo && (
//                                 <div className={`mb-1 px-2 py-1 rounded text-xs border-l-2 ${
//                                   isCurrentUser 
//                                     ? 'border-blue-500 bg-blue-50' 
//                                     : 'border-gray-500 bg-gray-100'
//                                 }`}>
//                                   <p className="font-medium">
//                                     {message.replyTo.sender.id === session?.user?.email
//                                       ? "You"
//                                       : message.replyTo.sender.name}
//                                   </p>
//                                   <p className="truncate">
//                                     {message.replyTo.content}
//                                   </p>
//                                 </div>
//                               )}
//                               <div
//                                 className={`rounded-lg px-4 py-2 ${
//                                   isCurrentUser
//                                     ? "bg-blue-500 text-white"
//                                     : "bg-white"
//                                 }`}
//                               >
//                                 {!isCurrentUser && (
//                                   <p className="text-xs font-medium mb-1">
//                                     {message.sender.name}
//                                   </p>
//                                 )}
//                                 <p>{message.content}</p>
//                                 {message.attachments?.length > 0 && (
//                                   <div className="mt-2 space-y-2">
//                                     {message.attachments.map((attachment, i) => (
//                                       <div key={i} className="rounded-md overflow-hidden">
//                                         {attachment.type === 'image' ? (
//                                           <img
//                                             src={attachment.url}
//                                             alt={attachment.name || "Attachment"}
//                                             className="max-h-48 object-cover"
//                                           />
//                                         ) : (
//                                           <a
//                                             href={attachment.url}
//                                             target="_blank"
//                                             rel="noopener noreferrer"
//                                             className={`inline-flex items-center px-3 py-1 rounded-md ${
//                                               isCurrentUser
//                                                 ? 'bg-blue-400 text-white'
//                                                 : 'bg-gray-200'
//                                             }`}
//                                           >
//                                             <Paperclip className="h-3 w-3 mr-1" />
//                                             <span className="text-xs">
//                                               {attachment.name || 'Download'}
//                                             </span>
//                                           </a>
//                                         )}
//                                       </div>
//                                     ))}
//                                   </div>
//                                 )}
//                                 <div className="flex justify-between items-center mt-1">
//                                   <p
//                                     className={`text-xs ${
//                                       isCurrentUser
//                                         ? "text-blue-100"
//                                         : "text-gray-500"
//                                     }`}
//                                   >
//                                     {formatTime(message.timestamp)}
//                                     {message.edited && " (edited)"}
//                                   </p>
//                                   <div className="flex space-x-1">
//                                     {message.reactions?.map((reaction, i) => (
//                                       <span 
//                                         key={i}
//                                         className="text-xs bg-white bg-opacity-20 rounded-full px-1"
//                                         onClick={() => !isCurrentUser && handleAddReaction(
//                                           message.id, 
//                                           reaction.emoji
//                                         )}
//                                       >
//                                         {reaction.emoji}
//                                       </span>
//                                     ))}
//                                   </div>
//                                 </div>
//                               </div>
//                               <div className="flex justify-end mt-1 space-x-2">
//                                 <DropdownMenu>
//                                   <DropdownMenuTrigger asChild>
//                                     <Button 
//                                       variant="ghost" 
//                                       size="xs" 
//                                       className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
//                                     >
//                                       <ChevronDown className="h-3 w-3" />
//                                     </Button>
//                                   </DropdownMenuTrigger>
//                                   <DropdownMenuContent align="end">
//                                     <DropdownMenuItem
//                                       onClick={() => setReplyMessage(message)}
//                                     >
//                                       Reply
//                                     </DropdownMenuItem>
//                                     {isCurrentUser && (
//                                       <>
//                                         <DropdownMenuItem>
//                                           Edit
//                                         </DropdownMenuItem>
//                                         <DropdownMenuItem className="text-red-600">
//                                           Delete
//                                         </DropdownMenuItem>
//                                       </>
//                                     )}
//                                     <DropdownMenuItem>
//                                       Add Reaction
//                                     </DropdownMenuItem>
//                                   </DropdownMenuContent>
//                                 </DropdownMenu>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       )
//                     })}
//                     <div ref={messagesEndRef} />
//                   </>
//                 )}
//               </div>
//             </ScrollArea>

//             {/* Reply preview */}
//             {replyMessage && (
//               <div className="border-t bg-gray-100 px-4 py-2 flex justify-between items-center">
//                 <div>
//                   <p className="text-xs font-medium">Replying to {replyMessage.sender.id === session?.user?.email ? "yourself" : replyMessage.sender.name}</p>
//                   <p className="text-xs truncate">{replyMessage.content}</p>
//                 </div>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="h-6 w-6"
//                   onClick={() => setReplyMessage(null)}
//                 >
//                   <X className="h-4 w-4" />
//                 </Button>
//               </div>
//             )}

//             {/* Message input */}
//             <div className="p-4 border-t bg-white">
//               {attachments.length > 0 && (
//                 <div className="flex gap-2 mb-2 overflow-x-auto">
//                   {attachments.map((attachment, i) => (
//                     <div key={i} className="relative">
//                       {attachment.type === 'image' ? (
//                         <img
//                           src={attachment.preview}
//                           alt="Preview"
//                           className="h-16 w-16 object-cover rounded-md"
//                         />
//                       ) : (
//                         <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
//                           <Paperclip className="h-5 w-5 text-gray-500" />
//                         </div>
//                       )}
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-gray-200 hover:bg-gray-300"
//                         onClick={() => removeAttachment(i)}
//                       >
//                         <X className="h-3 w-3" />
//                       </Button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//               <div className="flex items-center gap-2">
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => fileInputRef.current?.click()}
//                 >
//                   <Paperclip className="h-5 w-5" />
//                   <input
//                     type="file"
//                     ref={fileInputRef}
//                     onChange={handleFileUpload}
//                     className="hidden"
//                     multiple
//                   />
//                 </Button>
//                 <div className="relative flex-1">
//                   <Textarea
//                     placeholder="Type a message"
//                     className="min-h-[40px] resize-none pr-10"
//                     rows={1}
//                     value={messageInput}
//                     onChange={(e) => {
//                       setMessageInput(e.target.value)
//                       if (e.target.value) {
//                         handleTyping()
//                       } else {
//                         handleStopTyping()
//                       }
//                     }}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter" && !e.shiftKey) {
//                         e.preventDefault()
//                         handleSendMessage()
//                       }
//                     }}
//                   />
//                   <div className="absolute right-2 bottom-2">
//                     <EmojiPicker
//                       open={showEmojiPicker}
//                       onOpenChange={setShowEmojiPicker}
//                       onSelect={(emoji) => {
//                         setMessageInput(prev => prev + emoji)
//                         setShowEmojiPicker(false)
//                       }}
//                     >
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         className="h-8 w-8"
//                         type="button"
//                       >
//                         <Smile className="h-4 w-4" />
//                       </Button>
//                     </EmojiPicker>
//                   </div>
//                 </div>
//                 <Button 
//                   onClick={handleSendMessage}
//                   disabled={isSending || (!messageInput.trim() && attachments.length === 0)}
//                 >
//                   <Send className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>
//           </>
//         ) : (
//           <div className="flex-1 flex items-center justify-center bg-gray-50">
//             <div className="text-center">
//               <Users className="h-12 w-12 mx-auto text-gray-400" />
//               <h3 className="mt-2 text-lg font-medium text-gray-900">
//                 Select a chat to start messaging
//               </h3>
//               <p className="mt-1 text-gray-500">
//                 Or start a new conversation
//               </p>
//               <Button
//                 className="mt-4"
//                 onClick={() => setShowNewChatModal(true)}
//               >
//                 <Plus className="h-4 w-4 mr-2" />
//                 New Chat
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* New chat modal */}
//       <Dialog
//         open={showNewChatModal}
//         onOpenChange={setShowNewChatModal}
//       >
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <DialogTitle>New Chat</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div className="relative">
//               <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
//               <Input
//                 placeholder="Search users"
//                 className="pl-10"
//               />
//             </div>
//             <ScrollArea className="h-96">
//               <div className="space-y-2">
//                 <Button
//                   variant="ghost"
//                   className="w-full justify-start"
//                   onClick={() => {
//                     // For simplicity, creating group with first 3 users
//                     const participantIds = users
//                       .filter((user) => user.id !== session?.user?.email)
//                       .slice(0, 3)
//                       .map((user) => user.id)
//                     createGroupChat(participantIds, "New Group")
//                   }}
//                 >
//                   <Users className="h-4 w-4 mr-2" />
//                   Create Group Chat
//                 </Button>
//                 {users
//                   .filter((user) => user.id !== session?.user?.email)
//                   .map((user) => (
//                     <div
//                       key={user.id}
//                       className="p-3 hover:bg-gray-50 cursor-pointer flex items-center"
//                       onClick={() => createNewChat(user.id)}
//                     >
//                       <div className="relative">
//                         <Avatar className="h-10 w-10">
//                           <AvatarImage src={user.avatar} />
//                           <AvatarFallback>
//                             {user.name?.charAt(0) || "U"}
//                           </AvatarFallback>
//                         </Avatar>
//                         <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
//                           user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
//                         }`} />
//                       </div>
//                       <div className="ml-3">
//                         <h3 className="font-medium">{user.name}</h3>
//                         <p className="text-sm text-gray-500">{user.email}</p>
//                       </div>
//                     </div>
//                   ))}
//               </div>
//             </ScrollArea>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }