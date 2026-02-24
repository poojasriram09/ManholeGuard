import { Routes, Route } from 'react-router-dom';
import ReportIssuePage from './pages/ReportIssuePage';
import TrackStatusPage from './pages/TrackStatusPage';
import PublicHeatmapPage from './pages/PublicHeatmapPage';
import LoginPortalPage from './pages/LoginPortalPage';

export default function App() {
  return (
    <div className="min-h-screen bg-surface-base bg-grid">
      <header className="glass border-b border-border text-text-primary py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold font-heading">ManholeGuard</h1>
          <nav className="flex gap-4 text-sm">
            <a href="/" className="text-text-secondary hover:text-text-primary transition-colors">Report</a>
            <a href="/track" className="text-text-secondary hover:text-text-primary transition-colors">Track</a>
            <a href="/heatmap" className="text-text-secondary hover:text-text-primary transition-colors">Map</a>
            <a href="/login" className="text-text-secondary hover:text-text-primary transition-colors">Login</a>
          </nav>
        </div>
      </header>
      <main className="max-w-3xl mx-auto p-6 animate-fade-in-up">
        <Routes>
          <Route path="/" element={<ReportIssuePage />} />
          <Route path="/track" element={<TrackStatusPage />} />
          <Route path="/heatmap" element={<PublicHeatmapPage />} />
          <Route path="/login" element={<LoginPortalPage />} />
        </Routes>
      </main>
    </div>
  );
}
