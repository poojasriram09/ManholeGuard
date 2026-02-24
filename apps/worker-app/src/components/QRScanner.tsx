import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

const SCANNER_ELEMENT_ID = 'qr-scanner-region';

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);

  // Keep callback refs current without triggering re-renders
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (scanner) {
      try {
        const state = scanner.getState();
        // State 2 = SCANNING, 3 = PAUSED
        if (state === 2 || state === 3) {
          await scanner.stop();
        }
      } catch {
        // Scanner may already be stopped; ignore
      }
      try {
        scanner.clear();
      } catch {
        // Element may already be cleared; ignore
      }
      scannerRef.current = null;
    }
    if (mountedRef.current) {
      setIsRunning(false);
    }
  }, []);

  const startScanner = useCallback(async () => {
    setCameraError(null);

    // Clean up any existing scanner instance first
    await stopScanner();

    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Stop scanning after successful read
          scanner.stop().catch(() => {});
          if (mountedRef.current) {
            setIsRunning(false);
          }
          onScanRef.current(decodedText);
        },
        () => {
          // QR code not detected in frame -- intentionally ignored
        }
      );

      if (mountedRef.current) {
        setIsRunning(true);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to access camera';

      if (mountedRef.current) {
        setCameraError(message);
        setIsRunning(false);
      }
      onErrorRef.current?.(message);
    }
  }, [stopScanner]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      const scanner = scannerRef.current;
      if (scanner) {
        scanner.stop().catch(() => {});
        try { scanner.clear(); } catch { /* ignore */ }
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="rounded-2xl overflow-hidden bg-black">
      {/* Scanner viewport */}
      <div
        id={SCANNER_ELEMENT_ID}
        className="w-full min-h-[300px] bg-surface"
      />

      {/* Controls */}
      <div className="p-4 bg-surface">
        {cameraError && (
          <div className="bg-danger-muted border border-danger/30 text-danger rounded-xl p-3 mb-3 text-sm text-center">
            {cameraError}
          </div>
        )}

        {!isRunning ? (
          <button
            type="button"
            onClick={startScanner}
            className="w-full btn-primary active:bg-accent text-white rounded-2xl py-5 text-lg font-bold transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9V5a2 2 0 012-2h4M15 3h4a2 2 0 012 2v4M21 15v4a2 2 0 01-2 2h-4M9 21H5a2 2 0 01-2-2v-4" />
            </svg>
            Start Scanner
          </button>
        ) : (
          <button
            type="button"
            onClick={stopScanner}
            className="w-full bg-surface-elevated active:bg-surface-hover text-white rounded-2xl py-5 text-lg font-bold transition-colors"
          >
            Stop Scanner
          </button>
        )}

        <p className="text-text-muted text-xs text-center mt-3">
          Point camera at the manhole QR code
        </p>
      </div>
    </div>
  );
}
