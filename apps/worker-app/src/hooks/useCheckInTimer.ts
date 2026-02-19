import { useState, useEffect, useCallback, useRef } from 'react';
import { apiRequest } from '../api/client';
import { offlineStore } from '../db/offline-store';

interface PendingCheckIn {
  id: string;
  entryLogId: string;
  promptedAt: string;
}

export function useCheckInTimer(entryId: string | undefined) {
  const [pendingCheckIn, setPendingCheckIn] = useState<PendingCheckIn | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [responded, setResponded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Poll for pending check-in prompts
  useEffect(() => {
    if (!entryId) return;

    const poll = async () => {
      try {
        const res = await apiRequest<{ data: any[] }>(`/checkin/entry/${entryId}`);
        const pending = res.data.find((ci: any) => !ci.respondedAt);
        if (pending && pending.id !== pendingCheckIn?.id) {
          setPendingCheckIn(pending);
          setCountdown(60);
          setResponded(false);

          // Play audio alert
          try {
            if (!audioRef.current) {
              audioRef.current = new Audio('/audio/checkin-prompt.mp3');
            }
            audioRef.current.play().catch(() => {});
          } catch {}

          // Vibrate
          if (navigator.vibrate) {
            navigator.vibrate([300, 100, 300, 100, 300]);
          }
        }
      } catch {
        // Offline — will use cached data
      }
    };

    poll();
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, [entryId, pendingCheckIn?.id]);

  // Countdown timer
  useEffect(() => {
    if (!pendingCheckIn || responded) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pendingCheckIn, responded]);

  const respond = useCallback(
    async (method: string = 'tap') => {
      if (!pendingCheckIn) return;

      try {
        await apiRequest('/checkin/respond', {
          method: 'POST',
          body: JSON.stringify({ checkInId: pendingCheckIn.id, method }),
        });
      } catch {
        // Offline — queue the response
        await offlineStore.queueCheckInResponse(pendingCheckIn.id, method);
      }

      setResponded(true);
      setPendingCheckIn(null);
    },
    [pendingCheckIn]
  );

  const dismiss = useCallback(() => {
    setPendingCheckIn(null);
    setResponded(false);
  }, []);

  return {
    pendingCheckIn,
    countdown,
    responded,
    respond,
    dismiss,
    hasPending: !!pendingCheckIn && !responded,
  };
}
