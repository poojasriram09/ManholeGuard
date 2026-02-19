import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useDashboardStore } from '../../store/dashboardStore';

export default function Layout() {
  const sidebarOpen = useDashboardStore((s) => s.sidebarOpen);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-surface-base">
      <Sidebar />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-grid">
          <div key={location.pathname} className="animate-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
