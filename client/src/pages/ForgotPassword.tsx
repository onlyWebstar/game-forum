// pages/ForgotPassword.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
    } catch (err: any) {
      if (!err.response) {
        setError(
          'Cannot reach the server. It may be waking up (free hosting sleeps when idle). Wait a minute and try again.'
        );
      } else {
        setError(
          err.response.data?.errors?.[0]?.msg ||
            err.response.data?.message ||
            'Something went wrong. Please try again.'
        );
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
          {sent ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="font-display text-2xl font-bold mb-3">Check your email</h1>
              <p className="text-muted-foreground mb-2">
                If an account exists for{' '}
                <strong className="text-foreground break-all">{email}</strong>, we've sent a link
                to reset your password.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                The link expires in 1 hour. Can't find it? Check your spam folder.
              </p>

              <div className="space-y-3">
                <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
                  Try a different email
                </Button>
                <Link to="/login" className="block">
                  <Button className="w-full">
                    Back to login
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold mb-2">Forgot your password?</h1>
              <p className="text-muted-foreground mb-6">
                Enter the email you registered with and we'll send you a link to choose a new one.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-500" role="alert">
                    {error}
                  </p>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={loading || !email.trim()}>
                  {loading ? 'Sending...' : 'Send reset link'}
                </Button>
              </form>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;