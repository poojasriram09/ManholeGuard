import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useDashboardStore } from '../../store/dashboardStore';

export default function Layout() {
  const sidebarOpen = useDashboardStore((s) => s.sidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
