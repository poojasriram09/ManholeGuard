import { Routes, Route } from 'react-router-dom';
import ReportIssuePage from './pages/ReportIssuePage';
import TrackStatusPage from './pages/TrackStatusPage';
import PublicHeatmapPage from './pages/PublicHeatmapPage';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">ManholeGuard</h1>
          <nav className="flex gap-4 text-sm">
            <a href="/" className="hover:underline">Report</a>
            <a href="/track" className="hover:underline">Track</a>
            <a href="/heatmap" className="hover:underline">Map</a>
          </nav>
        </div>
      </header>
      <main className="max-w-3xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<ReportIssuePage />} />
          <Route path="/track" element={<TrackStatusPage />} />
          <Route path="/heatmap" element={<PublicHeatmapPage />} />
        </Routes>
      </main>
    </div>
  );
}
