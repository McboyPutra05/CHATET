import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Expense {
  id: string;
  date: string;
  amount: number;
  type: 'out' | 'in';
  category: string;
  notes: string;
  budget_id?: string;
}

interface BudgetState {
  budgetId: string | null;
  totalTargetBudget: number;
  totalDays: number;
  startDate: string;
  expenses: Expense[];
  plannedSpends: Record<string, number>;
  isInitialized: boolean;

  initializeData: (userId: string) => Promise<void>;
  setBudgetParams: (budget: number, days: number, startDate: string, userId: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'budget_id'>, userId: string) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setPlannedSpend: (dateStr: string, amount: number, userId: string) => Promise<void>;
  endBudget: () => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgetId: null,
  totalTargetBudget: 150000,
  totalDays: 30,
  startDate: new Date().toISOString().split('T')[0],
  expenses: [],
  plannedSpends: {},
  isInitialized: false,

  initializeData: async (userId: string) => {
    const { data: budget } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle(); // Use maybeSingle to avoid errors if no active budget
    
    if (budget) {
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .eq('budget_id', budget.id);

      const { data: plannedData } = await supabase
        .from('planned_spends')
        .select('*')
        .eq('budget_id', budget.id);

      const plannedMap: Record<string, number> = {};
      plannedData?.forEach(p => {
        plannedMap[p.date] = p.amount;
      });

      set({
        budgetId: budget.id,
        totalTargetBudget: budget.total_budget,
        totalDays: budget.total_days,
        startDate: budget.start_date,
        expenses: (expensesData as Expense[]) || [],
        plannedSpends: plannedMap,
        isInitialized: true
      });
    } else {
      set({ budgetId: null, expenses: [], plannedSpends: {}, isInitialized: true });
    }
  },

  setBudgetParams: async (budget, days, startDate, userId) => {
    const state = get();
    if (state.budgetId) {
      set({ totalTargetBudget: budget, totalDays: days, startDate });
      await supabase.from('budgets').update({
        total_budget: budget,
        total_days: days,
        start_date: startDate
      }).eq('id', state.budgetId);
    } else {
      const { data, error } = await supabase.from('budgets').insert({
        user_id: userId,
        total_budget: budget,
        total_days: days,
        start_date: startDate,
        is_active: true
      }).select().single();
      
      if (data && !error) {
        set({
          budgetId: data.id,
          totalTargetBudget: budget,
          totalDays: days,
          startDate: startDate,
          expenses: [],
          plannedSpends: {}
        });
      }
    }
  },

  addExpense: async (expense, userId) => {
    const budgetId = get().budgetId;
    if (!budgetId) return;

    const tempId = crypto.randomUUID();
    set((state) => ({
      expenses: [...state.expenses, { ...expense, id: tempId, budget_id: budgetId }]
    }));

    const { data } = await supabase.from('expenses').insert({
      user_id: userId,
      budget_id: budgetId,
      amount: expense.amount,
      type: expense.type,
      category: expense.category,
      date: expense.date,
      notes: expense.notes
    }).select().single();

    if (data) {
      set((state) => ({
        expenses: state.expenses.map(e => e.id === tempId ? data : e)
      }));
    }
  },

  updateExpense: async (id, updated) => {
    set((state) => ({
      expenses: state.expenses.map(e => e.id === id ? { ...e, ...updated } : e)
    }));
    await supabase.from('expenses').update(updated).eq('id', id);
  },

  deleteExpense: async (id) => {
    set((state) => ({
      expenses: state.expenses.filter(e => e.id !== id)
    }));
    await supabase.from('expenses').delete().eq('id', id);
  },

  setPlannedSpend: async (dateStr, amount, userId) => {
    const budgetId = get().budgetId;
    if (!budgetId) return;

    set((state) => ({
      plannedSpends: { ...state.plannedSpends, [dateStr]: amount }
    }));

    await supabase.from('planned_spends').upsert({
      user_id: userId,
      budget_id: budgetId,
      date: dateStr,
      amount: amount
    }, { onConflict: 'budget_id,date' });
  },

  endBudget: async () => {
    const budgetId = get().budgetId;
    if (!budgetId) return;
    
    await supabase.from('budgets').update({ is_active: false }).eq('id', budgetId);
    set({ budgetId: null, expenses: [], plannedSpends: {} });
  }
}));
