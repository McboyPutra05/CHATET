import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/useAuthStore';
import { useBudgetStore } from '../../store/useBudgetStore';
import { useAutoLogout } from '../../hooks/useAutoLogout';

export const AppLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuthStore();
  const { initializeData, isInitialized } = useBudgetStore();
  
  // Start auto-logout tracker
  useAutoLogout();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (user?.id) {
      initializeData(user.id);
    }
  }, [user?.id, initializeData]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-slate-950 text-white overflow-hidden font-sans">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-slate-900 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/5 p-1 flex items-center justify-center">
            <img src="/logoChatetIN.png" alt="ChatetIN" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">ChatetIN</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div className={cn(
        "fixed inset-y-0 left-0 w-64 bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col h-full",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative w-full">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 -z-10" />
        <div className="p-4 md:p-8 max-w-5xl mx-auto w-full pb-20 md:pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
