interface GasAlertBannerProps {
  dangerous: boolean;
  message?: string;
}

export default function GasAlertBanner({ dangerous, message }: GasAlertBannerProps) {
  if (!dangerous) return null;

  return (
    <div className="bg-gradient-to-r from-danger via-danger to-orange-600 text-white px-4 py-3 rounded-lg flex items-center gap-3 shadow-glow-danger">
      <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <div>
        <p className="font-heading font-bold text-sm">DANGEROUS GAS LEVELS DETECTED</p>
        {message && <p className="text-sm text-white/80 mt-0.5">{message}</p>}
      </div>
    </div>
  );
}
