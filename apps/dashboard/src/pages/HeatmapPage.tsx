import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { api } from '../api/client';

const RISK_COLORS = { SAFE: '#22c55e', CAUTION: '#f59e0b', PROHIBITED: '#ef4444' };
const CENTER: [number, number] = [19.076, 72.8777]; // Mumbai

export default function HeatmapPage() {
  const { data } = useQuery({
    queryKey: ['heatmap'],
    queryFn: () => api.get<{ data: any[] }>('/manholes/heatmap'),
  });

  const points = data?.data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Risk Heatmap</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '70vh' }}>
        <MapContainer center={CENTER} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((p: any) => (
            <CircleMarker
              key={p.id}
              center={[p.latitude, p.longitude]}
              radius={8 + (p.riskScore / 10)}
              fillColor={RISK_COLORS[p.riskLevel as keyof typeof RISK_COLORS]}
              fillOpacity={0.7}
              stroke={false}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{p.qrCodeId}</strong><br />
                  Area: {p.area}<br />
                  Risk: {p.riskLevel} ({p.riskScore})
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
