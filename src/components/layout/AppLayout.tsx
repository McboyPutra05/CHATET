import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const AppLayout = () => {
  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 -z-10" />
        <div className="p-8 max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
