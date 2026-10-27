// components/ServerWakeNotice.tsx
import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import api from '@/services/api';

// Free hosting puts the backend to sleep when idle. The first request after
// that can take about a minute, so tell visitors what is going on instead of
// leaving them with empty pages.
const SHOW_AFTER_MS = 3000;

const ServerWakeNotice: React.FC = () => {
  const [waking, setWaking] = useState(false);

  useEffect(() => {
    let finished = false;

    const timer = setTimeout(() => {
      if (!finished) setWaking(true);
    }, SHOW_AFTER_MS);

    api
      .get('/health', { timeout: 120000 })
      .catch(() => {
        // Even a failed check means the wait is over (or the server is down)
      })
      .finally(() => {
        finished = true;
        clearTimeout(timer);
        setWaking(false);
      });

    return () => {
      finished = true;
      clearTimeout(timer);
    };
  }, []);

  if (!waking) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-md glass-card border border-primary/30 rounded-lg px-4 py-3 shadow-lg flex items-start gap-3"
    >
      <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-medium text-foreground">Waking up the server...</p>
        <p className="text-muted-foreground">
          This demo runs on free hosting, which sleeps when idle. It usually takes under a minute to
          start, then everything is fast.
        </p>
      </div>
    </div>
  );
};

export default ServerWakeNotice;