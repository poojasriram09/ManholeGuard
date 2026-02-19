import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import ManholeMarker from './ManholeMarker';
import RiskLegend from './RiskLegend';

interface ManholePoint {
  id: string;
  latitude: number;
  longitude: number;
  riskScore: number;
  riskLevel: string;
  area: string;
}

interface CityHeatmapProps {
  manholes: ManholePoint[];
}

const DEFAULT_CENTER: [number, number] = [19.076, 72.8777];
const DEFAULT_ZOOM = 12;

export default function CityHeatmap({ manholes }: CityHeatmapProps) {
  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full z-0"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {manholes.map((m) => (
          <ManholeMarker key={m.id} manhole={m} />
        ))}
      </MapContainer>
      <div className="absolute bottom-4 right-4 z-[1000]">
        <RiskLegend />
      </div>
    </div>
  );
}
