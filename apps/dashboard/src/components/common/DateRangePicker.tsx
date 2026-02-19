interface DateRangePickerProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

export default function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm text-gray-500">From</label>
      <input type="date" value={from} onChange={(e) => onChange(e.target.value, to)}
        className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <label className="text-sm text-gray-500">To</label>
      <input type="date" value={to} onChange={(e) => onChange(from, e.target.value)}
        className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );
}
