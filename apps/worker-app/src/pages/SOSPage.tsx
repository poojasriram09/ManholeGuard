import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client';

export default function SOSPage() {
  const navigate = useNavigate();
  const [holding, setHolding] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [sosData, setSosData] = useState<any>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const startHold = () => {
    setHolding(true);
    timerRef.current = setTimeout(async () => {
      try {
        let lat: number | undefined, lng: number | undefined;
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          );
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch {}

        const res = await apiRequest<{ data: any }>('/sos/trigger', {
          method: 'POST',
          body: JSON.stringify({ workerId: 'current', latitude: lat, longitude: lng, method: 'button' }),
        });
        setSosData(res.data);
        setTriggered(true);

        // Vibrate
        if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 500]);
      } catch (err) {
        console.error(err);
      }
    }, 3000);
  };

  const endHold = () => {
    setHolding(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  if (triggered) {
    return (
      <div className="min-h-screen bg-red-600 text-white p-6 text-center flex flex-col items-center justify-center">
        <div className="text-6xl mb-4 animate-pulse">🚨</div>
        <h1 className="text-3xl font-bold mb-4">SOS ACTIVATED</h1>
        <p className="text-lg mb-6">Help is on the way</p>
        {sosData?.nearestHospital && (
          <div className="bg-white/20 rounded-xl p-4 mb-4 w-full max-w-sm">
            <p className="text-sm">Nearest Hospital</p>
            <p className="font-bold">{sosData.nearestHospital}</p>
            <p className="text-sm">{sosData.hospitalDistance} km away</p>
          </div>
        )}
        <button onClick={() => navigate('/')} className="mt-6 bg-white text-red-600 rounded-xl px-8 py-3 font-semibold">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-2">Emergency SOS</h1>
      <p className="text-gray-400 mb-8">Hold the button for 3 seconds</p>

      <button
        onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={endHold}
        onTouchStart={startHold} onTouchEnd={endHold}
        className={`w-48 h-48 rounded-full font-bold text-3xl shadow-2xl transition-all ${
          holding ? 'bg-red-700 scale-110' : 'bg-red-600 hover:bg-red-700'
        }`}>
        SOS
      </button>

      {holding && <p className="mt-6 text-yellow-400 animate-pulse">Keep holding...</p>}

      <button onClick={() => navigate(-1)} className="mt-12 text-gray-400 underline">Cancel</button>
    </div>
  );
}
