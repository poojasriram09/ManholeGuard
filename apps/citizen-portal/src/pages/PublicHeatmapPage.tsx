import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const RISK_COLORS: Record<string, string> = { SAFE: '#22c55e', CAUTION: '#f59e0b', PROHIBITED: '#ef4444' };

export default function PublicHeatmapPage() {
  const [points, setPoints] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/public/heatmap`)
      .then((r) => r.json())
      .then((d) => setPoints(d.data || []))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manhole Risk Map</h2>
      <div className="rounded-lg overflow-hidden shadow" style={{ height: '70vh' }}>
        <MapContainer center={[19.076, 72.8777]} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((p: any) => (
            <CircleMarker key={p.id} center={[p.latitude, p.longitude]}
              radius={6 + (p.riskScore / 15)} fillColor={RISK_COLORS[p.riskLevel]} fillOpacity={0.7} stroke={false}>
              <Popup>
                <strong>{p.area}</strong><br />
                Risk: {p.riskLevel} ({p.riskScore})
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <div className="flex gap-6 justify-center mt-4 text-sm">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-safe inline-block" /> Safe</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-caution inline-block" /> Caution</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-prohibited inline-block" /> Prohibited</span>
      </div>
    </div>
  );
}
