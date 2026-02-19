import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_URL = 'ws://localhost:4000/ws';
const RECONNECT_DELAY = 3000;

export function useWebSocket(url = DEFAULT_URL) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);

  const connect = useCallback(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => {
      setConnected(false);
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
    };
    ws.onerror = () => ws.close();
    ws.onmessage = (event) => setLastMessage(event);
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((data: string | Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }, []);

  return { connected, lastMessage, sendMessage };
}
