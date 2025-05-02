'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function InviteStudentsModal({
  open,
  onOpenChange,
  sessionId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
}) {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/students/my-students');
        const data = await res.json();
        setStudents(data.students);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Failed to load students');
      }
    };
    
    fetchStudents();
  }, [open]);

  const handleInvite = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/video-sessions/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          studentIds: selectedStudents,
        }),
      });
      
      if (!res.ok) throw new Error('Failed to send invites');
      
      toast.success('Invites sent successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error inviting students:', error);
      toast.error('Failed to send invites');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Students</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
          {students.map((student) => (
            <div key={student._id} className="flex items-center space-x-2">
              <Checkbox
                id={`student-${student._id}`}
                checked={selectedStudents.includes(student._id)}
                onCheckedChange={(checked) => {
                  setSelectedStudents(prev =>
                    checked
                      ? [...prev, student._id]
                      : prev.filter(id => id !== student._id)
                  );
                }}
              />
              <Label htmlFor={`student-${student._id}`} className="cursor-pointer">
                {student.name} ({student.email})
              </Label>
            </div>
          ))}
          
          {students.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No students available to invite
            </p>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleInvite}
            disabled={selectedStudents.length === 0 || loading}
          >
            {loading ? 'Sending...' : 'Send Invites'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}