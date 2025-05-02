'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clipboard, Mail } from 'lucide-react';
import { toast } from 'sonner';
import InviteStudentsModal from '@/components/modals/InviteStudentsModal';
import SessionControls from './SessionControls';

export default function TutorSessionView({ tutorId }: { tutorId: string }) {
  const [session, setSession] = useState<any>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [sessionLink, setSessionLink] = useState('');

  const createSession = async () => {
    try {
      const res = await fetch('/api/video-sessions/create', {
        method: 'POST',
      });
      const data = await res.json();
      setSession(data.session);
      setSessionLink(`${window.location.origin}/student/video-session/${data.session._id}`);
      toast.success('Session created successfully');
    } catch (error) {
      toast.error('Failed to create session');
      console.error(error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sessionLink);
    toast.info('Link copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Video Session</h1>
      
      {!session ? (
        <Button onClick={createSession}>
          Create New Session
        </Button>
      ) : (
        <>
          <SessionControls sessionId={session._id} isTutor={true} />
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={sessionLink}
                readOnly
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={copyToClipboard}>
                <Clipboard className="h-4 w-4" />
              </Button>
            </div>
            
            <Button onClick={() => setShowInviteModal(true)}>
              <Mail className="mr-2 h-4 w-4" />
              Invite Students
            </Button>
          </div>
        </>
      )}
      
      <InviteStudentsModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        sessionId={session?._id}
      />
    </div>
  );
}