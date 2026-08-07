import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import { useBudgetStore } from '../store/useBudgetStore';
import { useAuthStore } from '../store/useAuthStore';
import type { Expense } from '../store/useBudgetStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus, Download, Trash2, Target, X } from 'lucide-react';

export const ExpenseTable = () => {
  const { expenses, addExpense, deleteExpense, budgetId, setBudgetParams, startDate } = useBudgetStore();
  const { user } = useAuthStore();
  
  // Quick Add Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'out' | 'in'>('out');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  
  // Budget Modal State
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [formBudget, setFormBudget] = useState(0);
  const [formDays, setFormDays] = useState(0);
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || !user?.id) return;
    
    // Check if user has an active budget
    if (!budgetId) {
      setShowBudgetModal(true);
      return;
    }
    
    await processAddExpense();
  };

  const processAddExpense = async () => {
    if (!user?.id) return;
    await addExpense({
      date,
      type,
      category: category || 'Uncategorized',
      amount: Number(amount),
      notes
    }, user.id);
    
    // Reset minimal
    setAmount('');
    setNotes('');
  };

  const handleSetInitialBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    await setBudgetParams(formBudget, formDays, formStartDate, user.id);
    setShowBudgetModal(false);
    
    // Optionally auto-add the pending expense after setting budget
    if (amount) {
      await processAddExpense();
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Category', 'Amount', 'Notes'];
    const rows = expenses.map(e => [
      e.id,
      e.date,
      e.type,
      e.category,
      e.amount.toString(),
      `"${e.notes.replace(/"/g, '""')}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: 'date',
      header: 'Tanggal',
      cell: (info) => <span className="text-slate-300">{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'type',
      header: 'Jenis',
      cell: (info) => {
        const val = info.getValue() as string;
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${val === 'in' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            {val.toUpperCase()}
          </span>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Kategori',
      cell: (info) => <span className="font-medium">{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'amount',
      header: 'Nominal',
      cell: (info) => {
        const amount = info.getValue() as number;
        const type = info.row.original.type;
        return (
          <span className={`font-medium ${type === 'in' ? 'text-emerald-400' : 'text-slate-100'}`}>
            {type === 'out' ? '-' : '+'} {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)}
          </span>
        );
      },
    },
    {
      accessorKey: 'notes',
      header: 'Catatan',
      cell: (info) => <span className="text-slate-400 text-sm">{info.getValue() as string}</span>,
    },
    {
      id: 'actions',
      cell: (info) => (
        <button 
          onClick={() => deleteExpense(info.row.original.id)}
          className="text-slate-500 hover:text-red-400 transition-colors p-2"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    }
  ];

  const table = useReactTable({
    data: [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), // sort by date descending
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/5 pb-4 gap-4">
        <CardTitle className="text-lg">Catatan Transaksi</CardTitle>
        <button 
          onClick={exportToCSV}
          className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg transition-colors border border-slate-600/50"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </CardHeader>
      
      {/* Budget Required Modal Overlay */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowBudgetModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                <Target className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Tentukan Target Dulu!</h2>
              <p className="text-sm text-slate-400">
                Anda belum memiliki target budget yang aktif. Silakan isi target dan durasi baru sebelum mencatat transaksi.
              </p>
            </div>

            <form onSubmit={handleSetInitialBudget} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Total Budget (Rp)</label>
                <input 
                  type="number" 
                  value={formBudget}
                  onChange={(e) => setFormBudget(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Durasi (Hari)</label>
                <input 
                  type="number" 
                  value={formDays}
                  onChange={(e) => setFormDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Tanggal Mulai</label>
                <input 
                  type="date" 
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors mt-6"
              >
                Mulai Budgeting & Simpan
              </button>
            </form>
          </div>
        </div>
      )}

      <CardContent className="pt-6">
        {/* Quick Add Form */}
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <input
            type="date"
            value={date}
            min={startDate}
            onChange={(e) => setDate(e.target.value)}
            className="md:col-span-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            required
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'in' | 'out')}
            className="md:col-span-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="out">Pengeluaran</option>
            <option value="in">Pemasukan</option>
          </select>
          <input
            type="text"
            placeholder="Kategori"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="md:col-span-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            required
          />
          <input
            type="number"
            placeholder="Nominal (Rp)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="md:col-span-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            required
          />
          <input
            type="text"
            placeholder="Catatan..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="md:col-span-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <button 
            type="submit"
            className="md:col-span-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 py-2 transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" /> Tambah
          </button>
        </form>

        {/* Data Grid */}
        <div className="overflow-x-auto rounded-lg border border-slate-700/50 bg-slate-900/20">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800/80 border-b border-slate-700/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 font-medium tracking-wider">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-700/30 hover:bg-slate-800/40 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                    Belum ada data transaksi. Mulai catat pengeluaranmu!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
