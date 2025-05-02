'use client';

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/icons';

export default function SessionControls({
  sessionId,
  isTutor,
}: {
  sessionId: string;
  isTutor: boolean;
}) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [socket, setSocket] = useState<any>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  useEffect(() => {
    const initWebRTC = async () => {
      try {
        // Initialize socket
        const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL!);
        setSocket(newSocket);

        // Get user media
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(userStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = userStream;
        }

        // Create peer connection
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            // Add your TURN servers here if needed
          ],
        });
        setPeerConnection(pc);

        // Add local stream to peer connection
        userStream.getTracks().forEach(track => {
          pc.addTrack(track, userStream);
        });

        // ICE candidate handler
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            newSocket.emit('ice-candidate', {
              sessionId,
              candidate: event.candidate,
            });
          }
        };

        // Remote stream handler
        pc.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setStatus('connected');
          }
        };

        // Join session room
        newSocket.emit('join-session', { sessionId, isTutor });

        // Socket event handlers
        newSocket.on('offer', async (offer: RTCSessionDescriptionInit) => {
          if (!isTutor) {
            await pc.setRemoteDescription(offer);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            newSocket.emit('answer', { sessionId, answer });
          }
        });

        newSocket.on('answer', async (answer: RTCSessionDescriptionInit) => {
          if (isTutor) {
            await pc.setRemoteDescription(answer);
          }
        });

        newSocket.on('ice-candidate', async (candidate: RTCIceCandidateInit) => {
          try {
            await pc.addIceCandidate(candidate);
          } catch (error) {
            console.error('Error adding ICE candidate:', error);
          }
        });

        // If tutor, create offer
        if (isTutor) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          newSocket.emit('offer', { sessionId, offer });
        }
      } catch (error) {
        console.error('Error initializing WebRTC:', error);
        setStatus('disconnected');
      }
    };

    initWebRTC();

    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (peerConnection) {
        peerConnection.close();
      }
    };
  }, [sessionId, isTutor]);

  const toggleMute = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setMuted(!muted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setVideoOff(!videoOff);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Your Video</h3>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto rounded-lg border"
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">
            {isTutor ? 'Student' : 'Tutor'} Video
          </h3>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-auto rounded-lg border"
          />
        </div>
      </div>
      
      <div className="flex justify-center gap-4">
        <Button
          variant={muted ? 'destructive' : 'outline'}
          size="icon"
          onClick={toggleMute}
        >
          {muted ? (
            <Icons.micOff className="h-5 w-5" />
          ) : (
            <Icons.mic className="h-5 w-5" />
          )}
        </Button>
        
        <Button
          variant={videoOff ? 'destructive' : 'outline'}
          size="icon"
          onClick={toggleVideo}
        >
          {videoOff ? (
            <Icons.videoOff className="h-5 w-5" />
          ) : (
            <Icons.video className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      <div className="flex justify-center">
        {status === 'connecting' && (
          <div className="flex items-center gap-2 text-sm text-yellow-600">
            <Icons.spinner className="h-4 w-4 animate-spin" />
            Connecting...
          </div>
        )}
        {status === 'connected' && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Icons.check className="h-4 w-4" />
            Connected
          </div>
        )}
        {status === 'disconnected' && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <Icons.x className="h-4 w-4" />
            Disconnected
          </div>
        )}
      </div>
    </Card>
  );
}