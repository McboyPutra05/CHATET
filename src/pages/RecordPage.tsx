import { useState } from 'react';
import { useBudgetStore } from '../store/useBudgetStore';
import { Card, CardContent } from '../components/ui/card';
import { Wallet, Plus, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const RecordPage = () => {
  const { totalTargetBudget, expenses, addExpense, deleteExpense } = useBudgetStore();
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'out' | 'in'>('out');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const totalSpent = expenses.filter(e => e.type === 'out').reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = totalTargetBudget - totalSpent;
  const isOverBudget = remainingBudget < 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    addExpense({
      date,
      type,
      category: category || 'Uncategorized',
      amount: Number(amount),
      notes
    });
    setAmount('');
    setNotes('');
  };

  const formatIDR = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  // Group by date for simple listing
  const expensesByDate: Record<string, typeof expenses> = {};
  expenses.forEach(e => {
    if (!expensesByDate[e.date]) expensesByDate[e.date] = [];
    expensesByDate[e.date].push(e);
  });
  const sortedDates = Object.keys(expensesByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Wallet className="w-64 h-64 text-emerald-500 transform rotate-12" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="text-emerald-400 font-medium tracking-widest text-sm uppercase mb-2">Total Terpakai</p>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white">
              {formatIDR(totalSpent)}
            </h1>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-950/50 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md">
            <div className={cn("p-4 rounded-xl", isOverBudget ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400")}>
              <Wallet className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Sisa Keseluruhan</p>
              <p className={cn("text-2xl font-bold", isOverBudget ? 'text-rose-400' : 'text-slate-100')}>
                {formatIDR(remainingBudget)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Form */}
      <Card className="border-white/5 bg-slate-900/50">
        <CardContent className="p-6">
          <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-12 gap-4">
            <div className="col-span-1 md:col-span-2">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none [&::-webkit-calendar-picker-indicator]:invert" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <select value={type} onChange={(e) => setType(e.target.value as 'in' | 'out')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none">
                <option value="out">Pengeluaran</option>
                <option value="in">Pemasukan</option>
              </select>
            </div>
            <div className="col-span-1 md:col-span-3">
              <input type="text" placeholder="Kategori (Makan, dll...)" value={category} onChange={(e) => setCategory(e.target.value)} required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <input type="number" placeholder="Nominal (Rp)" value={amount} onChange={(e) => setAmount(e.target.value)} required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" />
            </div>
            <div className="col-span-2 md:col-span-2">
              <input type="text" placeholder="Catatan (Opsional)" value={notes} onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <button type="submit" className="w-full min-h-[50px] md:h-full flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* History List Grouped by Date */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold tracking-tight">Riwayat Pengeluaran</h3>
        
        {sortedDates.length === 0 && (
          <div className="text-center py-12 text-slate-500 border border-dashed border-slate-700 rounded-2xl">
            Belum ada catatan transaksi.
          </div>
        )}

        {sortedDates.map((dateStr) => {
          const dayExpenses = expensesByDate[dateStr];
          
          return (
            <div key={dateStr} className="relative">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-slate-800 text-slate-300 text-xs font-semibold px-3 py-1 rounded-full border border-slate-700">
                  {new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="divide-y divide-slate-800/50">
                  {dayExpenses.map((expense) => (
                    <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                          expense.type === 'in' ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"
                        )}>
                          {expense.category.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{expense.category}</p>
                          {expense.notes && <p className="text-xs text-slate-500">{expense.notes}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={cn(
                          "font-bold",
                          expense.type === 'in' ? "text-emerald-400" : "text-slate-200"
                        )}>
                          {expense.type === 'in' ? '+' : '-'}{formatIDR(expense.amount)}
                        </span>
                        <button 
                          onClick={() => deleteExpense(expense.id)}
                          className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
