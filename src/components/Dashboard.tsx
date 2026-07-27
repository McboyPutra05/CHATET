import { useState } from 'react';
import { useBudgetStore } from '../store/useBudgetStore';
import { useAdaptiveBudget } from '../hooks/useAdaptiveBudget';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Wallet, CalendarDays, TrendingDown, Target, Settings2 } from 'lucide-react';

export const Dashboard = () => {
  const { totalTargetBudget, totalDays, startDate, setBudgetParams } = useBudgetStore();
  const { remainingBudget, remainingDays, newDailyAllowance, isOverBudget, totalSpent } = useAdaptiveBudget();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formBudget, setFormBudget] = useState(totalTargetBudget);
  const [formDays, setFormDays] = useState(totalDays);
  const [formDate, setFormDate] = useState(startDate);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setBudgetParams(formBudget, formDays, formDate);
    setIsEditing(false);
  };

  const progress = Math.min(100, Math.max(0, (totalSpent / totalTargetBudget) * 100));

  return (
    <div className="space-y-6">
      {/* Top Status Bar */}
      <Card className="bg-gradient-to-br from-emerald-900/40 to-slate-900 border-emerald-500/20 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
          <div 
            className={`h-full transition-all duration-1000 ${isOverBudget ? 'bg-red-500' : 'bg-emerald-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-emerald-400 font-medium tracking-wide text-sm uppercase mb-2">Jatah Kamu Hari Ini</p>
              <h1 className={`text-5xl md:text-6xl font-bold tracking-tight ${isOverBudget ? 'text-red-400' : 'text-white'}`}>
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(newDailyAllowance)}
              </h1>
              <p className="text-slate-400 mt-2 text-sm">
                Berdasarkan target sisa <span className="text-white font-medium">{remainingDays} hari</span>
              </p>
            </div>
            <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
              <div className="p-3 bg-slate-700/50 rounded-lg text-emerald-400">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Sisa Budget</p>
                <p className={`text-xl font-bold ${remainingBudget < 0 ? 'text-red-400' : 'text-slate-100'}`}>
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(remainingBudget)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simulator Panel */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" /> Target & Durasi
          </CardTitle>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <Settings2 className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="pt-6">
          {isEditing ? (
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Total Budget (Rp)</label>
                <input 
                  type="number" 
                  value={formBudget}
                  onChange={(e) => setFormBudget(Number(e.target.value))}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Durasi (Hari)</label>
                <input 
                  type="number" 
                  value={formDays}
                  onChange={(e) => setFormDays(Number(e.target.value))}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Tanggal Mulai</label>
                <input 
                  type="date" 
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/30 flex items-center gap-4">
                <div className="bg-emerald-500/10 p-2.5 rounded-lg text-emerald-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Budget</p>
                  <p className="font-semibold text-lg">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalTargetBudget)}</p>
                </div>
              </div>
              <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/30 flex items-center gap-4">
                <div className="bg-blue-500/10 p-2.5 rounded-lg text-blue-400">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Hari</p>
                  <p className="font-semibold text-lg">{totalDays} Hari</p>
                </div>
              </div>
              <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/30 flex items-center gap-4">
                <div className="bg-rose-500/10 p-2.5 rounded-lg text-rose-400">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Terpakai</p>
                  <p className="font-semibold text-lg">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalSpent)}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
