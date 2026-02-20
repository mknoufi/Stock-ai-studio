import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { StockProvider } from './contexts/StockContext';
import LoginScreen from './screens/LoginScreen';
import StaffDashboard from './screens/StaffDashboard';
import ItemVerification from './screens/ItemVerification';
import NewSession from './screens/NewSession';
import SupervisorDashboard from './screens/SupervisorDashboard';
import VarianceList from './screens/VarianceList';
import ConflictResolution from './screens/ConflictResolution';
import AdminDashboard from './screens/AdminDashboard';
import SettingsScreen from './screens/SettingsScreen';
import AboutScreen from './screens/AboutScreen';
import SessionSummary from './screens/SessionSummary';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="fixed bottom-6 left-6 z-[60] size-12 rounded-full bg-white dark:bg-surface-dark text-slate-800 dark:text-blue-400 shadow-2xl border border-slate-200 dark:border-border-dark flex items-center justify-center transition-all active:scale-90"
      title="Toggle Theme"
    >
      <span className="material-symbols-outlined text-2xl">
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <StockProvider>
        <ToastProvider>
          <ScrollToTop />
          <ThemeToggle />
          <div className="min-h-screen w-full max-w-md mx-auto relative shadow-2xl overflow-hidden bg-background-light dark:bg-background-dark">
            <Routes>
              <Route path="/" element={<LoginScreen />} />
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff/verify" element={<ItemVerification />} />
              <Route path="/staff/new-session" element={<NewSession />} />
              <Route path="/staff/summary" element={<SessionSummary />} />
              <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
              <Route path="/supervisor/variances" element={<VarianceList />} />
              <Route path="/supervisor/conflicts" element={<ConflictResolution />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/settings" element={<SettingsScreen />} />
              <Route path="/about" element={<AboutScreen />} />
            </Routes>
          </div>
        </ToastProvider>
      </StockProvider>
    </HashRouter>
  );
};

export default App;