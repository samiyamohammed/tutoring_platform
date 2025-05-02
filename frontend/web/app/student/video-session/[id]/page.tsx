import { getCurrentUser } from '@/lib/auth';
import StudentSessionView from '@/components/video-session/StudentSessionView';

export default async function StudentVideoSessionPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'student') {
    throw new Error('Unauthorized access');
  }

  return (
    <div className="container mx-auto p-4">
      <StudentSessionView sessionId={params.id} studentId={user.id} />
    </div>
  );
}