import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HealthStrip } from '../components/HealthStrip';
import { useToast } from '../components/Toast';
import { useStock } from '../contexts/StockContext';
import { ErrorState } from '../components/UIStates';
import { InputField } from '../components/InputField';

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { login, isLoading, error, clearError } = useStock();
  const [username, setUsername] = useState('');

  const handleLogin = async () => {
    if (!username) {
        showToast('Please enter a username', 'error');
        return;
    }
    
    try {
        await login(username);
        
        if (username.toLowerCase().includes('admin')) {
            showToast('Welcome, Admin', 'success');
            navigate('/admin/dashboard');
        } else if (username.toLowerCase().includes('sup')) {
             showToast('Welcome, Supervisor', 'success');
             navigate('/supervisor/dashboard');
        } else {
             showToast('Authenticated securely via LAN', 'success');
             navigate('/staff/dashboard');
        }
    } catch (e) {
        // Error is handled by context state and displayed below, or we can toast it
        showToast('Login failed. Please try again.', 'error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark transition-colors">
      {/* Top Status Strip */}
      <div className="bg-white dark:bg-slate-900 border-b border-primary/10 dark:border-border-dark px-4 py-3 shadow-sm sticky top-0 z-10">
        <HealthStrip variant="full" />
      </div>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center px-6 pt-12 pb-24">
        {/* Branding Section */}
        <div className="w-full max-w-sm mb-12 text-center flex flex-col items-center">
          <div className="flex items-center gap-3 mb-3">
             {/* Stylized Logo Icon */}
             <div className="size-14 bg-primary dark:bg-blue-600 rounded-full flex items-center justify-center text-white font-serif italic font-black text-5xl pb-1 pr-1 shadow-xl shadow-primary/30 dark:shadow-blue-900/40">
                 e
             </div>
             {/* Stylized Text */}
             <div className="flex items-baseline text-slate-900 dark:text-white leading-none">
                 <span className="text-3xl font-semibold tracking-tight">Lavanya</span>
                 <span className="text-3xl font-black tracking-tight ml-0.5">mart</span>
                 <span className="text-2xl font-black text-primary dark:text-blue-400 align-top ml-0.5 -mt-2">+</span>
             </div>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Solutions for modern living</p>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-sm space-y-5">
          {error && (
             <div className="animate-in fade-in slide-in-from-top-2">
                <ErrorState message={error} onRetry={() => { clearError(); handleLogin(); }} />
             </div>
          )}

          <InputField
            label="Username"
            icon="person"
            placeholder="Enter ID (e.g. staff, sup, admin)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />

          <InputField
            label="Password"
            icon="lock"
            type="password"
            placeholder="••••••••"
            defaultValue="password"
            disabled={isLoading}
          />

          {/* Biometric Toggle */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-primary/10 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary/60 dark:text-blue-400">fingerprint</span>
              <span className="text-sm font-medium text-[#111318] dark:text-slate-200">Enable Biometrics</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input defaultChecked className="sr-only peer" type="checkbox" disabled={isLoading} />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary dark:peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
            </label>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-primary dark:bg-blue-600 hover:bg-primary/90 dark:hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 dark:shadow-blue-900/30 transition-all flex items-center justify-center gap-2 mt-4 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    AUTHENTICATING...
                </span>
            ) : (
                <>
                    LOGIN
                    <span className="material-symbols-outlined !text-lg">login</span>
                </>
            )}
          </button>

          {/* LAN Configuration (Hidden/Subtle) */}
          <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700/50">
             <div className="flex items-center gap-2 mb-2">
               <span className="material-symbols-outlined text-sm text-slate-500">settings_ethernet</span>
               <span className="text-xs font-bold uppercase text-slate-500">LAN Configuration</span>
             </div>
             <input disabled={isLoading} className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded text-xs py-2 px-3 font-mono disabled:opacity-50" defaultValue="192.168.1.50:8080" />
          </div>

          {/* Forgot Password */}
          <div className="text-center pt-4">
            <a className="text-sm font-semibold text-primary/80 dark:text-blue-400 hover:text-primary dark:hover:text-blue-300 cursor-pointer">Forgot Password?</a>
          </div>
          
           {/* Quick Link for Demo */}
          <div className="text-center pt-8 opacity-50">
             <span className="text-xs dark:text-slate-500">Demo Shortcuts:</span>
             <div className="flex flex-wrap gap-4 justify-center mt-2">
                 <button disabled={isLoading} onClick={() => { setUsername('staff'); }} className="text-xs underline dark:text-slate-400 hover:text-primary disabled:opacity-50">Staff</button>
                 <button disabled={isLoading} onClick={() => { setUsername('sup'); }} className="text-xs underline dark:text-slate-400 hover:text-primary disabled:opacity-50">Supervisor</button>
                 <button disabled={isLoading} onClick={() => { setUsername('admin'); }} className="text-xs underline dark:text-slate-400 hover:text-primary disabled:opacity-50">Admin</button>
             </div>
          </div>

        </div>
      </main>

      {/* Bottom Connection Banner */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-primary/10 dark:border-slate-800 p-4 backdrop-blur-lg">
        <div className="max-w-md mx-auto flex flex-col gap-3">
          {/* Mode Information */}
          <div className="flex items-center justify-between bg-primary/5 dark:bg-slate-800/80 px-4 py-2.5 rounded-lg border border-primary/10 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary dark:text-blue-400 !text-xl">settings_ethernet</span>
              <span className="text-xs font-semibold text-[#111318] dark:text-slate-300 uppercase tracking-tighter">Mode: LAN</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-primary/80 dark:text-blue-400/90 dark:bg-blue-500/10 px-2 py-0.5 rounded">192.168.1.50</span>
            </div>
          </div>
          {/* Bottom Navigation Sim */}
          <div className="flex gap-2 justify-between items-center px-2">
            <button className="flex flex-1 flex-col items-center justify-center gap-1 rounded-full text-primary dark:text-blue-400">
              <span className="material-symbols-outlined">login</span>
            </button>
            <button onClick={() => navigate('/settings')} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-600 hover:text-primary dark:hover:text-white">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <button onClick={() => navigate('/about')} className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-600 hover:text-primary dark:hover:text-white">
              <span className="material-symbols-outlined">info</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginScreen;