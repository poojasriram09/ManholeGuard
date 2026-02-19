import { auth } from '../lib/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  // Get fresh Firebase ID token (auto-refreshing)
  const token = await auth.currentUser?.getIdToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Request failed');
  return data;
}
