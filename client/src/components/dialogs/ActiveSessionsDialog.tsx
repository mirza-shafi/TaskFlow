import { useState, useEffect } from 'react';
import { Loader2, Monitor, Smartphone, Tablet, MapPin, Clock, X, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import * as authApi from '@/lib/api/auth';
import { toast } from 'sonner';
import type { Session } from '@/types/api';

interface ActiveSessionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActiveSessionsDialog({
  open,
  onOpenChange,
}: ActiveSessionsDialogProps) {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [sessionToRevoke, setSessionToRevoke] = useState<Session | null>(null);

  useEffect(() => {
    if (open) {
      loadSessions();
    }
  }, [open]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await authApi.getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      setRevokingId(sessionId);
      await authApi.revokeSession(sessionId);
      toast.success('Device logged out successfully');
      // Reload sessions
      await loadSessions();
      setSessionToRevoke(null);
    } catch (error) {
      console.error('Failed to revoke session:', error);
      toast.error('Failed to logout from device');
    } finally {
      setRevokingId(null);
    }
  };

  const confirmRevokeSession = (session: Session) => {
    setSessionToRevoke(session);
  };

  const getDeviceIcon = (device?: string) => {
    if (!device) return Monitor;
    const deviceLower = device.toLowerCase();
    if (deviceLower.includes('mobile') || deviceLower.includes('phone')) {
      return Smartphone;
    }
    if (deviceLower.includes('tablet') || deviceLower.includes('ipad')) {
      return Tablet;
    }
    return Monitor;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getCurrentSessionId = () => {
    // Try to identify current session (simplified approach)
    // In a real app, you'd store the session ID on login
    return sessions[0]?._id; // Assume first session is current
  };

  const currentSessionId = getCurrentSessionId();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Active Sessions</DialogTitle>
          <DialogDescription>
            Manage your logged-in devices and locations
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto pr-2 flex-1">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active sessions found
              </div>
            ) : (
              sessions.map((session) => {
                const DeviceIcon = getDeviceIcon(session.deviceInfo?.device);
                const isCurrentSession = session._id === currentSessionId;

                return (
                  <Card key={session._id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <DeviceIcon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">
                            {session.deviceInfo?.browser || 'Unknown Browser'}
                            {session.deviceInfo?.os && ` on ${session.deviceInfo.os}`}
                          </h4>
                          {isCurrentSession && (
                            <Badge variant="outline" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-1">
                          {session.deviceInfo?.device && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Monitor className="h-3 w-3" />
                              <span>{session.deviceInfo.device}</span>
                            </div>
                          )}

                          {session.ipAddress && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{session.ipAddress}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Last active {formatDate(session.lastActivity)}</span>
                          </div>
                        </div>
                      </div>

                      {!isCurrentSession && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmRevokeSession(session)}
                          disabled={revokingId === session._id}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Logout from this device"
                        >
                          {revokingId === session._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <X className="h-4 w-4" />
                              <span className="ml-1 text-xs hidden sm:inline">Logout</span>
                            </>
                          )}
                        </Button>
                      )}
                      {isCurrentSession && (
                        <Badge variant="secondary" className="text-xs">
                          This device
                        </Badge>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!sessionToRevoke} onOpenChange={(open) => !open && setSessionToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Logout from device?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout from{' '}
              <strong>
                {sessionToRevoke?.deviceInfo?.browser || 'Unknown Browser'}
                {sessionToRevoke?.deviceInfo?.os && ` on ${sessionToRevoke.deviceInfo.os}`}
              </strong>
              ? This will end the session on that device immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => sessionToRevoke && handleRevokeSession(sessionToRevoke._id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Yes, Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
