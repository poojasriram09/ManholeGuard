interface ReportExportButtonsProps {
  onExport: (format: string) => void;
}

const formats = [
  { value: 'pdf', label: 'PDF', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
  { value: 'csv', label: 'CSV', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { value: 'json', label: 'JSON', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
];

export default function ReportExportButtons({ onExport }: ReportExportButtonsProps) {
  return (
    <div className="flex gap-2">
      {formats.map((f) => (
        <button
          key={f.value}
          onClick={() => onExport(f.value)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
          </svg>
          {f.label}
        </button>
      ))}
    </div>
  );
}
