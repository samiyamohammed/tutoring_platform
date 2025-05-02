'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import SessionControls from './SessionControls';

export default function StudentSessionView({
  sessionId,
  studentId,
}: {
  sessionId: string;
  studentId: string;
}) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const verifyAndFetchSession = async () => {
      try {
        const res = await fetch(`/api/video-sessions/${sessionId}/verify?studentId=${studentId}`);
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Not authorized');
        }
        
        setSession(data.session);
      } catch (err: any) {
        setError(err.message);
        router.replace('/');
      } finally {
        setLoading(false);
      }
    };
    
    verifyAndFetchSession();
  }, [sessionId, studentId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Session with {session?.tutor?.name}
      </h1>
      <SessionControls sessionId={sessionId} isTutor={false} />
    </div>
  );
}