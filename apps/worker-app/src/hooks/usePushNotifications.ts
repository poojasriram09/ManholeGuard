import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api/client';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && permission === 'granted') {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((sub) => {
          if (sub) setSubscription(sub);
        });
      });
    }
  }, [permission]);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      setError('Push notifications not supported');
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === 'granted') {
        await subscribe();
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !VAPID_PUBLIC_KEY) return;

    try {
      const registration = await navigator.serviceWorker.ready;

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
      });

      setSubscription(sub);

      // Persist subscription to server
      await apiRequest('/sync/push-subscription', {
        method: 'POST',
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    if (subscription) {
      await subscription.unsubscribe();
      setSubscription(null);
    }
  }, [subscription]);

  return {
    permission,
    subscription,
    error,
    requestPermission,
    unsubscribe,
    isSubscribed: !!subscription,
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
