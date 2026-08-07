import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { History, Loader2, CalendarDays, Wallet, AlertOctagon } from 'lucide-react';

interface BudgetHistory {
  id: string;
  total_budget: number;
  total_days: number;
  start_date: string;
  created_at: string;
  expenses: { amount: number; type: string }[];
}

export const HistoryPage = () => {
  const { user } = useAuthStore();
  const [history, setHistory] = useState<BudgetHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('budgets')
          .select('*, expenses(amount, type)')
          .eq('user_id', user.id)
          .eq('is_active', false)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setHistory(data as BudgetHistory[]);
      } catch (err) {
        console.error('Error fetching history', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistory();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 text-emerald-400">
          <History className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Riwayat Budgeting</h2>
          <p className="text-slate-400 text-sm">Catatan perjalanan target dan durasi yang sudah lalu.</p>
        </div>
      </div>

      {history.length === 0 ? (
        <Card className="bg-slate-900/50 border-dashed border-2 border-slate-700">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 mb-4">
              <History className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Belum ada Riwayat</h3>
            <p className="text-slate-400 max-w-sm">Anda belum memiliki riwayat budgeting yang sudah berakhir atau dihentikan.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {history.map((budget) => {
            const totalSpent = budget.expenses
              .filter(e => e.type === 'out')
              .reduce((sum, e) => sum + e.amount, 0);
            
            const isDeficit = totalSpent > budget.total_budget;
            
            const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

            return (
              <Card key={budget.id} className="bg-slate-900/60 hover:bg-slate-900/80 transition-colors border-slate-700/50 relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-1 h-full ${isDeficit ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center justify-between">
                    <span>Mulai: {new Date(budget.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    {isDeficit && (
                      <span className="flex items-center gap-1 text-xs text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">
                        <AlertOctagon className="w-3 h-3" /> Terminated
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Target Budget</p>
                      <p className="text-xl font-bold text-white">{formatCurrency(budget.total_budget)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Terpakai</p>
                      <p className={`text-xl font-bold ${isDeficit ? 'text-rose-400' : 'text-slate-200'}`}>
                        {formatCurrency(totalSpent)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <CalendarDays className="w-4 h-4 text-slate-500" />
                      <span>{budget.total_days} Hari</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400 justify-end">
                      <Wallet className="w-4 h-4 text-slate-500" />
                      <span>Defisit: {isDeficit ? formatCurrency(totalSpent - budget.total_budget) : 'Rp 0'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
