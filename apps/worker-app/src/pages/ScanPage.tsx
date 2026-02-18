import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { apiRequest } from '../api/client';

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => { scannerRef.current?.stop().catch(() => {}); };
  }, []);

  const startScanning = async () => {
    setScanning(true);
    setError('');
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await scanner.stop();
          setScanning(false);
          try {
            const res = await apiRequest<{ data: any }>('/scan', {
              method: 'POST',
              body: JSON.stringify({ qrCodeId: decodedText }),
            });
            setResult(res.data);
          } catch (err: any) {
            setError(err.message);
          }
        },
        () => {}
      );
    } catch (err: any) {
      setError('Camera access denied');
      setScanning(false);
    }
  };

  const handleStartEntry = async () => {
    if (!result?.manhole) return;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
      });

      const res = await apiRequest<{ data: any }>('/entry/start', {
        method: 'POST',
        body: JSON.stringify({
          workerId: 'current', // resolved server-side
          manholeId: result.manhole.id,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      });
      navigate(`/checklist/${res.data.id}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const riskColors: Record<string, string> = {
    SAFE: 'bg-green-500',
    CAUTION: 'bg-yellow-500',
    PROHIBITED: 'bg-red-500',
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-center mb-4">Scan QR Code</h1>

      {!result && (
        <>
          <div id="qr-reader" className="w-full rounded-lg overflow-hidden mb-4" />
          {!scanning && (
            <button onClick={startScanning} className="w-full bg-blue-600 text-white rounded-xl py-4 text-lg font-semibold">
              Start Scanner
            </button>
          )}
        </>
      )}

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mt-4">{error}</div>}

      {result && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="text-center mb-4">
            <div className={`inline-block px-4 py-2 rounded-full text-white font-bold ${riskColors[result.risk?.riskLevel] || 'bg-gray-500'}`}>
              {result.risk?.riskLevel} — Score: {result.risk?.riskScore}
            </div>
          </div>
          <div className="space-y-2 text-sm mb-6">
            <p><strong>Area:</strong> {result.manhole?.area}</p>
            <p><strong>QR:</strong> {result.manhole?.qrCodeId}</p>
            <p><strong>Max Workers:</strong> {result.manhole?.maxWorkers}</p>
          </div>

          {result.risk?.riskLevel === 'PROHIBITED' ? (
            <div className="bg-red-100 text-red-800 p-4 rounded-lg text-center font-semibold">
              ENTRY PROHIBITED — Risk level too high
            </div>
          ) : (
            <button onClick={handleStartEntry} className="w-full bg-green-600 text-white rounded-xl py-4 text-lg font-semibold">
              Proceed to Entry
            </button>
          )}

          <button onClick={() => { setResult(null); setError(''); }} className="w-full mt-3 bg-gray-200 text-gray-700 rounded-xl py-3">
            Scan Another
          </button>
        </div>
      )}

      {/* SOS Button — always visible */}
      <button onClick={() => navigate('/sos')} className="fixed bottom-6 right-6 w-16 h-16 bg-red-600 text-white rounded-full shadow-lg text-xl font-bold flex items-center justify-center">
        SOS
      </button>
    </div>
  );
}
