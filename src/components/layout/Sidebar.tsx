import { Link, useLocation } from 'react-router-dom';
import { WalletMinimal, Target, LayoutDashboard, X, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar = ({ onClose }: SidebarProps) => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Pencatatan', path: '/', icon: LayoutDashboard },
    { name: 'Target & Durasi', path: '/target', icon: Target },
  ];

  return (
    <aside className="w-full h-full bg-slate-900 border-r border-white/5 flex flex-col">
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 rounded-xl">
            <WalletMinimal className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">X-Saving</h1>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                isActive 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-emerald-400" : "text-slate-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-white/5 space-y-4">
        <button
          onClick={async () => await supabase.auth.signOut()}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar (Logout)
        </button>
        <div className="text-xs text-slate-500 text-center">
          Extreme Saving V2
        </div>
      </div>
    </aside>
  );
};
