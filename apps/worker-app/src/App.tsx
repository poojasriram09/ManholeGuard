import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import ScanPage from './pages/ScanPage';
import ActiveSessionPage from './pages/ActiveSessionPage';
import ChecklistPage from './pages/ChecklistPage';
import CheckInPage from './pages/CheckInPage';
import HealthCheckPage from './pages/HealthCheckPage';
import SOSPage from './pages/SOSPage';
import LoginPage from './pages/LoginPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen max-w-md mx-auto">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={user ? <ScanPage /> : <Navigate to="/login" />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/checklist/:entryId" element={<ChecklistPage />} />
        <Route path="/session/:entryId" element={<ActiveSessionPage />} />
        <Route path="/checkin/:checkInId" element={<CheckInPage />} />
        <Route path="/health/:entryId" element={<HealthCheckPage />} />
        <Route path="/sos" element={<SOSPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </div>
  );
}
