import { useAuthStore } from '../../store/authStore';
import { useDashboardStore } from '../../store/dashboardStore';

export default function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const toggleSidebar = useDashboardStore((s) => s.toggleSidebar);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700 text-xl">
        ☰
      </button>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{user?.email}</span>
        <button onClick={logout} className="text-sm text-red-600 hover:text-red-800">
          Logout
        </button>
      </div>
    </header>
  );
}
