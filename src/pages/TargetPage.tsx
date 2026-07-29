import { useState } from 'react';
import { useBudgetStore } from '../store/useBudgetStore';
import { useSimulation } from '../hooks/useSimulation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Target, CalendarDays, TrendingDown, Save, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../lib/utils';

import { useAuthStore } from '../store/useAuthStore';

export const TargetPage = () => {
  const { user } = useAuthStore();
  const { totalTargetBudget, totalDays, startDate, setBudgetParams, plannedSpends, setPlannedSpend } = useBudgetStore();
  const [localSpends, setLocalSpends] = useState<Record<string, number>>(plannedSpends);
  const { simulation } = useSimulation(localSpends);
  
  const [formBudget, setFormBudget] = useState(totalTargetBudget);
  const [formDays, setFormDays] = useState(totalDays);
  const [formDate, setFormDate] = useState(startDate);
  const [showSaved, setShowSaved] = useState(false);
  const [activeAlertIndex, setActiveAlertIndex] = useState<number | null>(null);
  
  // Calculate total spent based on the simulation table (which includes user inputs)
  const simulationTotalSpent = simulation.reduce((sum, day) => sum + day.actualSpent, 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    await setBudgetParams(formBudget, formDays, formDate, user.id);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Target & Durasi</h2>
        <p className="text-slate-400 mt-1">Atur parameter dan lihat simulasi *extreme saving* per hari Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-white/5 shadow-none">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-400">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Budget</p>
              <p className="font-bold text-2xl">
                {formatIDR(totalTargetBudget)}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900 border-white/5 shadow-none">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-blue-500/10 p-3 rounded-xl text-blue-400">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Hari</p>
              <p className="font-bold text-2xl">{totalDays} Hari</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900 border-white/5 shadow-none">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-rose-500/10 p-3 rounded-xl text-rose-400">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Terpakai (Simulasi)</p>
              <p className="font-bold text-2xl text-slate-100">
                {formatIDR(simulationTotalSpent)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-white/5">
          <CardTitle>Pengaturan Parameter</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSave} className="space-y-6 max-w-xl">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Total Budget (Rp)</label>
              <input 
                type="number" 
                value={formBudget}
                onChange={(e) => setFormBudget(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
              />
              <p className="text-xs text-slate-500">Jumlah uang yang dialokasikan untuk durasi ini.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Durasi (Hari)</label>
              <input 
                type="number" 
                value={formDays}
                onChange={(e) => setFormDays(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Tanggal Mulai</label>
              <input 
                type="date" 
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
            <div className="pt-2 flex items-center gap-4">
              <button type="submit" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]">
                <Save className="w-5 h-5" /> Simpan Perubahan
              </button>
              {showSaved && <span className="text-emerald-400 text-sm font-medium animate-in fade-in">✓ Berhasil disimpan!</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Simulation Table with Alerts */}
      <Card>
        <CardHeader className="border-b border-white/5">
          <CardTitle>Simulasi & Riwayat Harian</CardTitle>
          <p className="text-sm text-slate-400">
            Daftar {totalDays} hari simulasi Anda. Terintegrasi langsung dengan pengeluaran aktual untuk menunjukkan sisa jatah harian.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {simulation.map((day) => {
              const isToday = day.dateStr === new Date().toISOString().split('T')[0];
              
              return (
                <div key={day.dayIndex} className="relative">
                  <div className={cn(
                    "flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border transition-colors",
                    day.isOverspent 
                      ? "bg-rose-950/20 border-rose-500/30" 
                      : (isToday ? "bg-emerald-950/20 border-emerald-500/30" : "bg-slate-900/50 border-slate-800")
                  )}>
                    <div className="flex items-center gap-4 mb-2 md:mb-0">
                      <div className="w-14 text-center">
                        <span className="text-xs text-slate-500 block">HARI</span>
                        <span className="text-xl font-black text-slate-300">{day.dayIndex}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">
                          {new Date(day.dateStr).toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                        {isToday && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">Hari Ini</span>}
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full md:w-auto mt-2 md:mt-0 pl-18 md:pl-0">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 font-medium">JATAH HARIAN</span>
                        <span className="font-bold text-slate-200">{formatIDR(day.allowanceForDay)}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 font-medium">TERPAKAI AKTUAL</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number"
                            placeholder="0"
                            value={localSpends[day.dateStr] !== undefined ? localSpends[day.dateStr] : (day.actualSpent || '')}
                            onChange={(e) => {
                              const val = e.target.value === '' ? undefined : Number(e.target.value);
                              setLocalSpends(prev => ({ ...prev, [day.dateStr]: val as number }));
                            }}
                            onBlur={async (e) => {
                              if (!user?.id) return;
                              const val = e.target.value === '' ? 0 : Number(e.target.value);
                              await setPlannedSpend(day.dateStr, val, user.id);
                            }}
                            className={cn(
                              "bg-slate-950 border rounded-lg px-3 py-1.5 text-sm w-32 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors text-right font-bold",
                              day.isOverspent ? "border-rose-500/50 text-rose-400" : (day.actualSpent > 0 ? "border-slate-700 text-slate-100" : "border-slate-800 text-slate-500")
                            )}
                          />
                          {day.isOverspent && (
                            <button 
                              type="button"
                              onClick={() => setActiveAlertIndex(activeAlertIndex === day.dayIndex ? null : day.dayIndex)}
                              className="bg-rose-500/20 p-1.5 rounded-full text-rose-400 hover:bg-rose-500/40 transition-colors animate-pulse"
                              title="Klik untuk melihat detail overbudget"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Popover */}
                  {activeAlertIndex === day.dayIndex && day.isOverspent && (
                    <div className="mt-2 p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-sm text-rose-200 animate-in slide-in-from-top-2 flex gap-3 items-start shadow-xl">
                      <Info className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-rose-300 mb-1">Batas Harian Terlampaui!</p>
                        <p>
                          Pengeluaran Anda sebesar <strong className="text-rose-100">{formatIDR(day.actualSpent)}</strong> melebihi 
                          jatah harian yang seharusnya <strong className="text-rose-100">{formatIDR(day.allowanceForDay)}</strong>.
                        </p>
                        <p className="mt-2 text-rose-300/80">
                          Anda kelebihan pengeluaran (Overspend) senilai <strong>{formatIDR(day.overspendAmount)}</strong>. 
                          Akibatnya, jatah untuk sisa hari berikutnya turun menjadi <strong className="text-emerald-400">{formatIDR(day.allowanceNextDay)}</strong>.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
