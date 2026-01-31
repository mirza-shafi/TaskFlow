import { useState } from 'react';
import { Loader2, AlertTriangle, Shield } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import * as usersApi from '@/lib/api/users';
import { toast } from 'sonner';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountDeleted: () => void;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  onAccountDeleted,
}: DeleteAccountDialogProps) {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [understood, setUnderstood] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText.toLowerCase() !== 'delete') {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    if (!understood) {
      toast.error('Please confirm you understand this action');
      return;
    }

    try {
      setLoading(true);
      await usersApi.deleteAccount();
      toast.success('Account deleted successfully');
      onAccountDeleted();
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setConfirmText('');
      setUnderstood(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Account Permanently
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 pt-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-foreground">This action cannot be undone!</p>
                  <p>Permanently deleting your account will:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Delete all your tasks and notes</li>
                    <li>Remove you from all teams</li>
                    <li>Delete all your habits and progress</li>
                    <li>Erase all your personal data</li>
                    <li>Revoke all active sessions</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="confirm-delete" className="text-sm font-medium">
                  Type <span className="font-bold text-destructive">DELETE</span> to confirm
                </Label>
                <Input
                  id="confirm-delete"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE here"
                  disabled={loading}
                  className="font-mono"
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="understand"
                  checked={understood}
                  onCheckedChange={(checked) => setUnderstood(checked as boolean)}
                  disabled={loading}
                />
                <label
                  htmlFor="understand"
                  className="text-sm leading-tight cursor-pointer select-none"
                >
                  I understand that this action is permanent and cannot be reversed
                </label>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={loading || confirmText.toLowerCase() !== 'delete' || !understood}
            className="bg-destructive hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete My Account'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
