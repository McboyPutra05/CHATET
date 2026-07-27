import { useMemo } from 'react';
import { useBudgetStore } from '../store/useBudgetStore';
import type { Expense } from '../store/useBudgetStore';

export interface DailySummary {
  date: string; // YYYY-MM-DD
  expenses: Expense[];
  totalSpent: number;
  allowanceForDay: number;
  isOverspent: boolean;
  overspendAmount: number;
  allowanceNextDay: number;
}

export const useHistoricalBudget = () => {
  const { totalTargetBudget, totalDays, startDate, expenses } = useBudgetStore();

  return useMemo(() => {
    // We only care about "out" expenses for budget tracking
    const outExpenses = expenses.filter(e => e.type === 'out');
    
    // Create a map of date -> expenses
    const expensesByDate: Record<string, Expense[]> = {};
    expenses.forEach(e => {
      if (!expensesByDate[e.date]) {
        expensesByDate[e.date] = [];
      }
      expensesByDate[e.date].push(e);
    });

    // Get all unique dates from expenses, plus today
    const todayStr = new Date().toISOString().split('T')[0];
    const allDates = new Set(Object.keys(expensesByDate));
    allDates.add(todayStr);
    
    // Sort dates chronologically
    const sortedDates = Array.from(allDates).sort();

    const dailySummaries: DailySummary[] = [];
    
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    let cumulativeSpent = 0;

    for (const dateStr of sortedDates) {
      const current = new Date(dateStr);
      current.setHours(0, 0, 0, 0);
      
      const diffTime = current.getTime() - start.getTime();
      const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // If the date is before start date, we don't calculate allowance, or treat it as day 0
      const effectiveDaysPassed = Math.max(0, daysPassed);
      const remainingDays = Math.max(1, totalDays - effectiveDaysPassed);
      
      const remainingBudget = totalTargetBudget - cumulativeSpent;
      const allowanceForDay = remainingBudget / remainingDays;

      const dayExpenses = expensesByDate[dateStr] || [];
      const dayOutTotal = dayExpenses
        .filter(e => e.type === 'out')
        .reduce((sum, e) => sum + e.amount, 0);

      const isOverspent = dayOutTotal > allowanceForDay;
      const overspendAmount = isOverspent ? dayOutTotal - allowanceForDay : 0;
      
      // Calculate what the allowance for the NEXT day becomes due to this day's spending
      const nextCumulativeSpent = cumulativeSpent + dayOutTotal;
      const nextRemainingBudget = totalTargetBudget - nextCumulativeSpent;
      const nextRemainingDays = Math.max(1, totalDays - (effectiveDaysPassed + 1));
      const allowanceNextDay = nextRemainingBudget / nextRemainingDays;

      dailySummaries.push({
        date: dateStr,
        expenses: dayExpenses,
        totalSpent: dayOutTotal,
        allowanceForDay: Math.max(0, allowanceForDay),
        isOverspent,
        overspendAmount,
        allowanceNextDay: Math.max(0, allowanceNextDay)
      });

      cumulativeSpent = nextCumulativeSpent;
    }

    // Sort descending for display (newest first)
    dailySummaries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Current allowance is just for today
    const todaySummary = dailySummaries.find(d => d.date === todayStr);
    const currentAllowance = todaySummary ? todaySummary.allowanceForDay : 0;
    const totalSpent = outExpenses.reduce((sum, e) => sum + e.amount, 0);
    const remainingBudget = totalTargetBudget - totalSpent;

    const todayDateObj = new Date();
    todayDateObj.setHours(0, 0, 0, 0);
    const diffTimeToday = todayDateObj.getTime() - start.getTime();
    const daysPassedToday = Math.floor(diffTimeToday / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(1, totalDays - Math.max(0, daysPassedToday));

    return {
      dailySummaries,
      currentAllowance: currentAllowance > 0 ? currentAllowance : 0,
      totalSpent,
      remainingBudget,
      remainingDays,
      isOverBudget: remainingBudget < 0
    };
  }, [totalTargetBudget, totalDays, startDate, expenses]);
};
