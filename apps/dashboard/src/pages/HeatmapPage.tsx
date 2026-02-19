import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { api } from '../api/client';

const RISK_COLORS = { SAFE: '#34d399', CAUTION: '#fbbf24', PROHIBITED: '#f43f5e' };
const CENTER: [number, number] = [19.076, 72.8777]; // Mumbai

export default function HeatmapPage() {
  const { data } = useQuery({
    queryKey: ['heatmap'],
    queryFn: () => api.get<{ data: any[] }>('/manholes/heatmap'),
  });

  const points = data?.data ?? [];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-primary mb-6">Risk Heatmap</h1>
      <div className="card-surface overflow-hidden" style={{ height: '70vh' }}>
        <MapContainer center={CENTER} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
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
