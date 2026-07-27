import { useMemo } from 'react';
import { useBudgetStore } from '../store/useBudgetStore';

export const useAdaptiveBudget = () => {
  const { totalTargetBudget, totalDays, startDate, expenses } = useBudgetStore();

  return useMemo(() => {
    // Only count expenses (out) for budget tracking
    const totalSpent = expenses
      .filter(item => item.type === 'out')
      .reduce((sum, item) => sum + item.amount, 0);
    
    const remainingBudget = totalTargetBudget - totalSpent;

    // Hitung hari yang sudah berlalu
    const start = new Date(startDate);
    // Ignore time for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - start.getTime();
    // Allow negative days passed if start date is in the future
    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Sisa hari (minimal 1 hari agar tidak division by zero)
    // If daysPassed is negative, we still have totalDays left, actually we have totalDays - daysPassed, but usually it starts at day 0.
    const remainingDays = Math.max(1, totalDays - Math.max(0, daysPassed));

    // Jatah harian adaptif untuk hari ini & sisa hari ke depan
    const newDailyAllowance = remainingBudget / remainingDays;

    return {
      totalSpent,
      remainingBudget,
      remainingDays,
      newDailyAllowance: newDailyAllowance > 0 ? newDailyAllowance : 0,
      isOverBudget: remainingBudget < 0,
      daysPassed: Math.max(0, daysPassed)
    };
  }, [totalTargetBudget, totalDays, startDate, expenses]);
};
