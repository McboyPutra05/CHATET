import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { History, Loader2, CalendarDays, Wallet, AlertOctagon, Download } from 'lucide-react';

interface Expense {
  id: string;
  amount: number;
  type: string;
  date: string;
  note: string;
  category: string;
}

interface BudgetHistory {
  id: string;
  total_budget: number;
  total_days: number;
  start_date: string;
  created_at: string;
  expenses: Expense[];
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
          .select('*, expenses(*)')
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

  const handleExportCSV = (budget: BudgetHistory) => {
    // Define headers
    const headers = ['Tanggal', 'Tipe', 'Kategori', 'Nominal', 'Catatan'];
    
    // Convert expenses to CSV rows
    const rows = budget.expenses.map(exp => [
      exp.date,
      exp.type === 'in' ? 'Pemasukan' : 'Pengeluaran',
      exp.category || '-',
      exp.amount.toString(),
      `"${(exp.note || '').replace(/"/g, '""')}"` // Escape quotes
    ]);
    
    // Add Summary at the end
    const totalSpent = budget.expenses.filter(e => e.type === 'out').reduce((sum, e) => sum + e.amount, 0);
    rows.push(['', '', '', '', '']);
    rows.push(['TARGET BUDGET', '', '', budget.total_budget.toString(), '']);
    rows.push(['TOTAL TERPAKAI', '', '', totalSpent.toString(), '']);
    rows.push([totalSpent > budget.total_budget ? 'DEFISIT' : 'SISA', '', '', Math.abs(budget.total_budget - totalSpent).toString(), '']);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `ChatetIN_Export_${budget.start_date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                    {isDeficit ? (
                      <span className="flex items-center gap-1 text-xs text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">
                        <AlertOctagon className="w-3 h-3" /> Terminated
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                        <Wallet className="w-3 h-3" /> Berhasil
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
                      <p className={`text-xl font-bold ${isDeficit ? 'text-rose-400' : 'text-emerald-400'}`}>
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
                      <span>{isDeficit ? 'Defisit:' : 'Sisa:'} {formatCurrency(Math.abs(budget.total_budget - totalSpent))}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleExportCSV(budget)}
                    className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <Download className="w-4 h-4" />
                    Export ke CSV
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
