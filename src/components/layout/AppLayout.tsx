import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, Loader2, AlertOctagon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/useAuthStore';
import { useBudgetStore } from '../../store/useBudgetStore';
import { useAutoLogout } from '../../hooks/useAutoLogout';
import { useAdaptiveBudget } from '../../hooks/useAdaptiveBudget';

export const AppLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuthStore();
  const { initializeData, isInitialized, totalTargetBudget, endBudget } = useBudgetStore();
  const { remainingBudget, remainingDays } = useAdaptiveBudget();
  const [terminationMessage, setTerminationMessage] = useState<string | null>(null);
  
  useAutoLogout();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (user?.id) {
      initializeData(user.id);
    }
  }, [user?.id, initializeData]);

  // Termination Logic Monitor
  useEffect(() => {
    // Only run logic if budget is initialized and active (totalTargetBudget > 0 means we likely have an active budget state loaded)
    if (!isInitialized || totalTargetBudget === 0) return;
    
    // Check if user is out of money or negative
    if (remainingBudget <= 0) {
      const isExtremeEnd = remainingDays <= 2;
      const isEarlyEnd = remainingDays > 3;
      
      let message = "";
      
      const deficit = Math.abs(remainingBudget);
      
      if (deficit >= 1 && deficit <= 10000) {
        if (isExtremeEnd) {
          message = "Perjalanan budgeting Anda dihentikan paksa sebelum waktunya karena uang Anda habis (mines Rp" + deficit.toLocaleString('id-ID') + "). Di bagusin lagi ya money management nya.";
        }
      } else if (deficit >= 11000 && deficit <= 100000) {
        if (isExtremeEnd) {
          message = "Perjalanan budgeting Anda dihentikan paksa sebelum waktunya karena uang Anda habis (mines Rp" + deficit.toLocaleString('id-ID') + "). Di bagusin lagi ya money management nya.";
        } else if (isEarlyEnd) {
          message = "Perjalanan budgeting Anda dihentikan paksa sebelum waktunya karena uang Anda habis (mines Rp" + deficit.toLocaleString('id-ID') + "). Ngatur duitnya yang bener dong, bates waktu lo masih lama. liat tutor yt dulu sono CARA NGATUR MONEY MANAGEMENT YANG BENER.";
        }
      } else if (deficit >= 101000) {
        message = "Perjalanan budgeting Anda dihentikan paksa sebelum waktunya (" + remainingDays + " hari lagi) karena uang Anda habis (mines Rp" + deficit.toLocaleString('id-ID') + "). TOLOL TOLOL, NGATUR DUITNYA Di bagusin lagi lah goblok, itu duit lu buang sia sia, ABIS BELAJAR MONEY MANAGEMENT COBA LU LATIH LAGI DISINI.";
      } else if (remainingBudget === 0) {
        // Just ran out exactly
         message = "Perjalanan budgeting Anda dihentikan karena jatah uang Anda telah habis 100%. Sisa waktu: " + remainingDays + " hari.";
      }

      if (message) {
        setTerminationMessage(message);
        // End the budget officially in the database
        endBudget();
      }
    }
  }, [remainingBudget, remainingDays, isInitialized, totalTargetBudget, endBudget]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-slate-950 text-white overflow-hidden font-sans">
      
      {/* Termination Modal */}
      {terminationMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-rose-500/30 p-8 rounded-3xl max-w-lg w-full shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <AlertOctagon className="w-10 h-10 text-rose-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-rose-500 mb-4 tracking-tight uppercase">Terminated!</h2>
              <p className="text-slate-300 text-lg leading-relaxed font-medium">
                {terminationMessage}
              </p>
            </div>
            <button 
              onClick={() => setTerminationMessage(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-colors mt-4"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}

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
      <div className="hidden md:flex flex-col w-64 h-full shrink-0 z-20 relative">
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
      <main className="flex-1 overflow-y-auto relative w-full z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 -z-10" />
        <div className="p-4 md:p-8 max-w-5xl mx-auto w-full pb-20 md:pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
