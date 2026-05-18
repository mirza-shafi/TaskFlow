import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loginWithGoogle } from '@/lib/api/auth';
import { toast } from 'sonner';

interface GoogleSignInButtonProps {
  /** Called after a successful Google sign-in (before navigation). */
  onSuccess?: () => void;
  /** Additional Tailwind classes to apply to the button. */
  className?: string;
}

/**
 * A styled "Continue with Google" button that:
 * 1. Opens the Firebase Google popup.
 * 2. Exchanges the ID token with the TaskFlow backend.
 * 3. Navigates to /app/dashboard on success.
 *
 * Handles all edge-cases (popup closed, popup blocked, backend errors) with
 * user-friendly toast messages.
 */
export function GoogleSignInButton({ onSuccess, className = '' }: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      onSuccess?.();
      toast.success('Welcome! Signed in with Google.');
      navigate('/app/dashboard');
    } catch (error: any) {
      const code: string = error?.code ?? '';

      // User deliberately closed the popup — no error needed
      if (code === 'auth/popup-closed-by-user') {
        return;
      }

      // Browser blocked the popup (e.g. opened on a user gesture timeout)
      if (code === 'auth/popup-blocked') {
        toast.error('Popup was blocked by your browser. Please allow popups for this site.');
        return;
      }

      // Backend validation / network error
      const message =
        error?.response?.data?.detail ??
        error?.message ??
        'Google sign-in failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      id="google-signin-btn"
      type="button"
      variant="outline"
      className={`w-full h-11 gap-2 ${className}`}
      onClick={handleGoogleLogin}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        /* Official Google "G" logo — full colour */
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      )}
      <span>{isLoading ? 'Signing in…' : 'Continue with Google'}</span>
    </Button>
  );
}
