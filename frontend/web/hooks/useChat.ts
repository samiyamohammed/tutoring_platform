import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import type { DefaultEventsMap } from "@socket.io/component-emitter";

export default function useChat() {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});

  const initializeSocket = useCallback(() => {
    if (!session?.user?.email) return;

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL, {
      auth: {
        token: session.user.email,
      },
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      newSocket.emit("joinRooms");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("userTyping", ({ userId, name }) => {
      setTypingUsers(prev => ({
        ...prev,
        [userId]: name
      }));
    });

    newSocket.on("userStoppedTyping", ({ userId }) => {
      setTypingUsers(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [session]);

  useEffect(() => {
    const cleanup = initializeSocket();
    return cleanup;
  }, [initializeSocket]);

interface EmitTypingFn {
    (roomId: string): void;
}

const emitTyping: EmitTypingFn = (roomId) => {
    if (socket) {
        socket.emit("typing", roomId);
    }
};

interface EmitStopTypingFn {
    (roomId: string): void;
}

const emitStopTyping: EmitStopTypingFn = (roomId) => {
    if (socket) {
        socket.emit("stopTyping", roomId);
    }
};

  return {
    socket,
    isConnected,
    typingUsers,
    emitTyping,
    emitStopTyping
  };
}