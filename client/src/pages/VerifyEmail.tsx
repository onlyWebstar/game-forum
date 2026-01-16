// pages/VerifyEmail.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await api.get(`/auth/verify-email/${token}`);
      
      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.message);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
      <div className="glass-card rounded-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold mb-2">Verifying Email...</h1>
            <p className="text-muted-foreground">Please wait while we verify your email address</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold mb-2 text-green-500">Email Verified!</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <p className="text-sm text-muted-foreground">Redirecting to login...</p>
            <Link to="/login">
              <Button className="mt-4">Go to Login</Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold mb-2 text-red-500">Verification Failed</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <Link to="/login">
                <Button variant="outline" className="w-full">Back to Login</Button>
              </Link>
              <Link to="/register">
                <Button className="w-full">Create New Account</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;