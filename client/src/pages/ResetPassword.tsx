// pages/ResetPassword.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

const MIN_PASSWORD_LENGTH = 6; // must match the backend validation

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [linkProblem, setLinkProblem] = useState(
    token ? '' : 'This reset link is missing its token.'
  );

  // After success, go to the login page
  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => navigate('/login'), 3000);
    return () => clearTimeout(timer);
  }, [done, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${encodeURIComponent(token as string)}`, { password });
      setDone(true);
    } catch (err: any) {
      if (!err.response) {
        setError(
          'Cannot reach the server. It may be waking up (free hosting sleeps when idle). Wait a minute and try again.'
        );
      } else if (err.response.data?.errors?.length) {
        // Validation problem with the password itself
        setError(err.response.data.errors[0].msg);
      } else if (err.response.status === 400) {
        // The token is invalid, expired, or already used
        setLinkProblem(
          err.response.data?.message || 'This reset link is invalid or has expired.'
        );
      } else {
        setError(err.response.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <Gamepad2 className="w-8 h-8 text-primary" />
          <span className="font-display text-2xl font-bold gradient-text">NEXUS</span>
        </Link>

        <div className="glass-card rounded-lg p-8 animate-fade-in">
          {done ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="font-display text-2xl font-bold mb-2 text-green-500">
                Password updated
              </h1>
              <p className="text-muted-foreground mb-6">
                You can now log in with your new password. Redirecting...
              </p>
              <Link to="/login">
                <Button className="w-full">Go to login</Button>
              </Link>
            </div>
          ) : linkProblem ? (
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="font-display text-2xl font-bold mb-2 text-red-500">
                Link not valid
              </h1>
              <p className="text-muted-foreground mb-6">{linkProblem}</p>
              <div className="space-y-3">
                <Link to="/forgot-password" className="block">
                  <Button className="w-full">Request a new link</Button>
                </Link>
                <Link to="/login" className="block">
                  <Button variant="outline" className="w-full">
                    Back to login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold mb-2">Choose a new password</h1>
              <p className="text-muted-foreground mb-6">
                Pick something you haven't used before. It needs at least {MIN_PASSWORD_LENGTH}{' '}
                characters.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    New password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter a new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-foreground"
                  >
                    Confirm new password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repeat the new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-500" role="alert">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading || !password || !confirmPassword}
                >
                  {loading ? 'Updating...' : 'Update password'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;