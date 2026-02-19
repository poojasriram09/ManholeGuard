import { NavLink } from 'react-router-dom';
import { useDashboardStore } from '../../store/dashboardStore';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'D' },
  { to: '/entries', label: 'Active Entries', icon: 'E' },
  { to: '/manholes', label: 'Manholes', icon: 'M' },
  { to: '/workers', label: 'Workers', icon: 'W' },
  { to: '/heatmap', label: 'Heatmap', icon: 'H' },
  { to: '/alerts', label: 'Alerts', icon: 'A' },
  { to: '/incidents', label: 'Incidents', icon: 'I' },
  { to: '/tasks', label: 'Tasks', icon: 'T' },
  { to: '/analytics', label: 'Analytics', icon: 'An' },
  { to: '/reports', label: 'Reports', icon: 'R' },
  { to: '/maintenance', label: 'Maintenance', icon: 'Mt' },
  { to: '/certifications', label: 'Certifications', icon: 'C' },
  { to: '/grievances', label: 'Grievances', icon: 'G' },
  { to: '/audit', label: 'Audit Log', icon: 'Au' },
  { to: '/settings', label: 'Settings', icon: 'S' },
];

export default function Sidebar() {
  const sidebarOpen = useDashboardStore((s) => s.sidebarOpen);
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all z-30 flex flex-col ${sidebarOpen ? 'w-64' : 'w-16'}`}>
      <div className="p-4 border-b border-gray-700">
        <h1 className={`font-bold text-lg ${sidebarOpen ? '' : 'text-center text-sm'}`}>
          {sidebarOpen ? 'ManholeGuard' : 'MG'}
        </h1>
      </div>
      <nav className="mt-4 space-y-0.5 flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center px-4 py-2.5 text-sm transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            <span className="w-6 text-center text-xs font-bold">{item.icon}</span>
            {sidebarOpen && <span className="ml-3">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-gray-700 p-4">
        <button onClick={logout}
          className={`text-gray-400 hover:text-white text-sm ${sidebarOpen ? '' : 'text-center w-full'}`}>
          {sidebarOpen ? 'Logout' : 'X'}
        </button>
      </div>
    </aside>
  );
}
