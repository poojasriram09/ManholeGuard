import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const RISK_COLORS: Record<string, string> = { SAFE: '#34d399', CAUTION: '#fbbf24', PROHIBITED: '#f43f5e' };

export default function PublicHeatmapPage() {
  const [points, setPoints] = useState<any[]>([]);
  const [grievances, setGrievances] = useState<any[]>([]);
  const [showGrievances, setShowGrievances] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/public/heatmap`).then((r) => r.json()).then((d) => setPoints(d.data || [])),
      fetch(`${API_URL}/public/grievances`).then((r) => r.json()).then((d) => setGrievances(d.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const safeCount = points.filter((p) => p.riskLevel === 'SAFE').length;
  const cautionCount = points.filter((p) => p.riskLevel === 'CAUTION').length;
  const prohibitedCount = points.filter((p) => p.riskLevel === 'PROHIBITED').length;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 font-heading text-text-primary">Manhole Risk Map</h2>

      {/* Risk Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-safe-muted rounded-lg p-3 text-center border border-safe/30">
          <p className="text-2xl font-bold text-safe">{safeCount}</p>
          <p className="text-xs text-safe">Safe (&lt;30)</p>
        </div>
        <div className="bg-caution-muted rounded-lg p-3 text-center border border-caution/30">
          <p className="text-2xl font-bold text-caution">{cautionCount}</p>
          <p className="text-xs text-caution">Caution (30-59)</p>
        </div>
        <div className="bg-danger-muted rounded-lg p-3 text-center border border-danger/30">
          <p className="text-2xl font-bold text-danger">{prohibitedCount}</p>
          <p className="text-xs text-danger">Prohibited (60+)</p>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input type="checkbox" checked={showGrievances} onChange={(e) => setShowGrievances(e.target.checked)}
            className="rounded" />
          Show citizen reports ({grievances.length})
        </label>
      </div>

      {loading ? (
        <div className="text-center py-20 text-text-muted">Loading map...</div>
      ) : (
        <div className="rounded-lg overflow-hidden shadow-card border border-border" style={{ height: '65vh' }}>
          <MapContainer center={[19.076, 72.8777]} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {points.map((p: any) => (
              <CircleMarker key={p.id} center={[p.latitude, p.longitude]}
                radius={6 + (p.riskScore / 15)} fillColor={RISK_COLORS[p.riskLevel]} fillOpacity={0.7} stroke={false}>
                <Popup>
                  <div className="text-sm">
                    <strong>{p.area}</strong><br />
                    QR: {p.qrCodeId}<br />
                    Risk: {p.riskLevel} ({p.riskScore})<br />
                    {p.hasGasSensor && <span>Gas Sensor: Active</span>}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
            {showGrievances && grievances.filter((g: any) => g.latitude && g.longitude).map((g: any) => (
              <CircleMarker key={g.id} center={[g.latitude, g.longitude]}
                radius={5} fillColor="#8b5cf6" fillOpacity={0.8} color="#7c3aed" weight={2}>
                <Popup>
                  <div className="text-sm">
                    <strong>{g.issueType}</strong><br />
                    Status: {g.status}<br />
                    {g.description?.slice(0, 80)}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-6 justify-center mt-4 text-sm">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#34d399' }} /> Safe
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#fbbf24' }} /> Caution
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#f43f5e' }} /> Prohibited
        </span>
        {showGrievances && (
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#8b5cf6' }} /> Reports
          </span>
        )}
      </div>
    </div>
  );
}
