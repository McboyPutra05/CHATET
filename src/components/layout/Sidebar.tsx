import { Link, useLocation, useNavigate } from 'react-router-dom';
import { WalletMinimal, Target, LayoutDashboard, X, LogOut, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar = ({ onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const navItems = [
    { name: 'Pencatatan', path: '/', icon: LayoutDashboard },
    { name: 'Target & Durasi', path: '/target', icon: Target },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

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
        {/* User Profile Card */}
        <div 
          onClick={() => {
            navigate('/profile');
            if (onClose) onClose();
          }}
          className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden shrink-0 border border-slate-600">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm">
                  {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-semibold text-white truncate">
                {user?.user_metadata?.full_name || 'Pengguna'}
              </span>
              <span className="text-xs text-slate-400 truncate">
                {user?.email}
              </span>
            </div>
          </div>
          <ChevronUp className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0" />
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar (Logout)
        </button>
      </div>
    </aside>
  );
};
