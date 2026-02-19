import { CircleMarker, Popup } from 'react-leaflet';

interface ManholeMarkerProps {
  manhole: {
    id: string;
    latitude: number;
    longitude: number;
    riskScore: number;
    riskLevel: string;
    area: string;
    qrCodeId?: string;
  };
  onClick?: () => void;
}

const riskColors: Record<string, string> = {
  SAFE: '#34d399',
  CAUTION: '#fbbf24',
  PROHIBITED: '#f43f5e',
};

export default function ManholeMarker({ manhole, onClick }: ManholeMarkerProps) {
  const color = riskColors[manhole.riskLevel] || '#64748b';
  const radius = Math.max(6, Math.min(20, manhole.riskScore / 5));

  return (
    <CircleMarker
      center={[manhole.latitude, manhole.longitude]}
      radius={radius}
      pathOptions={{ color, fillColor: color, fillOpacity: 0.6, weight: 2 }}
      eventHandlers={{ click: () => onClick?.() }}
    >
      <Popup>
        <div className="text-sm space-y-1">
          {manhole.qrCodeId && (
            <p className="font-semibold">QR: {manhole.qrCodeId}</p>
          )}
          <p>Area: {manhole.area}</p>
          <p>Risk Level: <span className="font-medium">{manhole.riskLevel}</span></p>
          <p>Risk Score: <span className="font-medium">{manhole.riskScore}</span></p>
        </div>
      </Popup>
    </CircleMarker>
  );
}
