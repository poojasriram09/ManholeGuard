interface DateRangePickerProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

export default function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm text-text-muted">From</label>
      <input type="date" value={from} onChange={(e) => onChange(e.target.value, to)}
        className="input-dark" />
      <label className="text-sm text-text-muted">To</label>
      <input type="date" value={to} onChange={(e) => onChange(from, e.target.value)}
        className="input-dark" />
    </div>
  );
}
