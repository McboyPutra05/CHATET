import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  type: 'out' | 'in';
  category: string;
  notes: string;
}

interface BudgetState {
  totalTargetBudget: number;
  totalDays: number;
  startDate: string;
  expenses: Expense[];
  plannedSpends: Record<string, number>;
  
  // Actions
  setBudgetParams: (budget: number, days: number, startDate: string) => void;
  setPlannedSpends: (spends: Record<string, number>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  clearAll: () => void;
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set) => ({
      totalTargetBudget: 150000,
      totalDays: 30,
      startDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      expenses: [],
      plannedSpends: {},

      setBudgetParams: (budget, days, startDate) => set({ totalTargetBudget: budget, totalDays: days, startDate }),
      setPlannedSpends: (spends) => set({ plannedSpends: spends }),
      
      addExpense: (expense) => set((state) => ({
        expenses: [
          ...state.expenses,
          { ...expense, id: crypto.randomUUID() }
        ]
      })),

      updateExpense: (id, updatedExpense) => set((state) => ({
        expenses: state.expenses.map(e => e.id === id ? { ...e, ...updatedExpense } : e)
      })),

      deleteExpense: (id) => set((state) => ({
        expenses: state.expenses.filter(e => e.id !== id)
      })),
      
      clearAll: () => set({ expenses: [] }),
    }),
    {
      name: 'extreme-saving-storage',
    }
  )
);
