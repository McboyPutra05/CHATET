import { useMemo } from 'react';
import { useBudgetStore } from '../store/useBudgetStore';

export interface SimulationDay {
  dayIndex: number;
  dateStr: string;
  allowanceForDay: number;
  actualSpent: number;
  isOverspent: boolean;
  overspendAmount: number;
  allowanceNextDay: number;
  remainingBudgetAtStart: number;
  remainingDaysAtStart: number;
}

export const useSimulation = (localPlannedSpends: Record<string, number> = {}) => {
  const { totalTargetBudget, totalDays, startDate, expenses } = useBudgetStore();

  return useMemo(() => {
    const expensesByDate: Record<string, number> = {};
    
    // Sum only "out" expenses by date
    expenses.filter(e => e.type === 'out').forEach(e => {
      if (!expensesByDate[e.date]) {
        expensesByDate[e.date] = 0;
      }
      expensesByDate[e.date] += e.amount;
    });

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const simulation: SimulationDay[] = [];
    let cumulativeSpent = 0;

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];

      const remainingBudgetAtStart = totalTargetBudget - cumulativeSpent;
      const remainingDaysAtStart = totalDays - i; // will be at least 1 since i < totalDays
      
      const allowanceForDay = remainingBudgetAtStart / remainingDaysAtStart;
      // Determine logged spend
      let isLogged = false;
      let loggedSpend = 0;

      if (localPlannedSpends[dateStr] !== undefined && localPlannedSpends[dateStr] !== null && !isNaN(localPlannedSpends[dateStr])) {
        isLogged = true;
        loggedSpend = localPlannedSpends[dateStr];
      } else if (expensesByDate[dateStr] !== undefined) {
        isLogged = true;
        loggedSpend = expensesByDate[dateStr];
      }

      // If logged, use the logged amount. Otherwise, assume they will perfectly meet the allowance (so target stays flat).
      const actualSpentForCalc = isLogged ? loggedSpend : allowanceForDay;
      
      const isOverspent = isLogged && loggedSpend > allowanceForDay;
      const overspendAmount = isOverspent ? loggedSpend - allowanceForDay : 0;

      const nextCumulativeSpent = cumulativeSpent + actualSpentForCalc;
      const remainingBudgetNextDay = totalTargetBudget - nextCumulativeSpent;
      const remainingDaysNextDay = Math.max(1, totalDays - (i + 1));
      
      const allowanceNextDay = remainingBudgetNextDay / remainingDaysNextDay;

      simulation.push({
        dayIndex: i + 1,
        dateStr,
        allowanceForDay: Math.max(0, allowanceForDay),
        actualSpent: isLogged ? loggedSpend : 0, // Pass 0 to UI for unlogged days
        isOverspent,
        overspendAmount,
        allowanceNextDay: Math.max(0, allowanceNextDay),
        remainingBudgetAtStart,
        remainingDaysAtStart
      });

      cumulativeSpent = nextCumulativeSpent;
    }

    return {
      simulation,
      totalTargetBudget,
      totalDays,
      startDate
    };
  }, [totalTargetBudget, totalDays, startDate, expenses, localPlannedSpends]);
};
