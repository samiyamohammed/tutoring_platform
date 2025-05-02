import { getCurrentUser } from '@/lib/auth';
import TutorSessionView from '@/components/video-session/TutorSessionView';

export default async function TutorVideoSessionPage() {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'tutor') {
    throw new Error('Unauthorized access');
  }

  return (
    <div className="container mx-auto p-4">
      <TutorSessionView tutorId={user.id} />
    </div>
  );
}