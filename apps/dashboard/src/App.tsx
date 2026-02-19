import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ActiveEntriesPage from './pages/ActiveEntriesPage';
import ManholesPage from './pages/ManholesPage';
import WorkersPage from './pages/WorkersPage';
import HeatmapPage from './pages/HeatmapPage';
import AlertsPage from './pages/AlertsPage';
import IncidentsPage from './pages/IncidentsPage';
import TasksPage from './pages/TasksPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ComplianceReportsPage from './pages/ComplianceReportsPage';
import MaintenancePage from './pages/MaintenancePage';
import CertificationsPage from './pages/CertificationsPage';
import GrievancesPage from './pages/GrievancesPage';
import AuditLogPage from './pages/AuditLogPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="entries" element={<ActiveEntriesPage />} />
        <Route path="manholes" element={<ManholesPage />} />
        <Route path="workers" element={<WorkersPage />} />
        <Route path="heatmap" element={<HeatmapPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="incidents" element={<IncidentsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="reports" element={<ComplianceReportsPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="certifications" element={<CertificationsPage />} />
        <Route path="grievances" element={<GrievancesPage />} />
        <Route path="audit" element={<AuditLogPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
