import { Database } from '@/integrations/supabase/types';

// Types
export type Trade = Database['public']['Tables']['trades']['Row'];
export type Strategy = Database['public']['Tables']['strategies']['Row'];

export interface PerformanceReport {
  winRatePerStrategy: Record<string, number>;
  avgRRPerStrategy: Record<string, number>;
  checklistCompletionVsOutcome: {
    withChecklist: { winRate: number; count: number };
    withoutChecklist: { winRate: number; count: number };
  };
  executionConsistency: {
    mostCommonTime: string | null;
    mostCommonPair: string | null;
  };
  tradeFrequency: { monthly: Record<string, number> };
  avgHoldingDuration: number;
  label: string;
  insights: string[];
}

// Helper: Calculate R:R ratio for a trade (simple: reward/abs(entry-exit))
function calcRR(trade: Trade): number | null {
  if (trade.entry_price && trade.exit_price) {
    const risk = Math.abs(trade.entry_price - trade.exit_price);
    if (risk > 0) return risk / risk; // Always 1, but placeholder for future stop_loss
  }
  return null;
}

export function analyzePerformance(trades: Trade[], strategies: Strategy[], checklistCompletion?: Record<string, boolean>): PerformanceReport {
  // Win rate per strategy
  const winRatePerStrategy: Record<string, number> = {};
  const rrPerStrategy: Record<string, number[]> = {};
  const avgRRPerStrategy: Record<string, number> = {};
  const stratCounts: Record<string, { win: number; total: number }> = {};

  trades.forEach(trade => {
    const stratId = (trade as any).strategy_id;
    if (!stratId) return;
    stratCounts[stratId] = stratCounts[stratId] || { win: 0, total: 0 };
    stratCounts[stratId].total++;
    if (trade.result === 'WIN') stratCounts[stratId].win++;
    // R:R
    const rr = calcRR(trade);
    if (rr !== null) {
      rrPerStrategy[stratId] = rrPerStrategy[stratId] || [];
      rrPerStrategy[stratId].push(rr);
    }
  });
  for (const stratId in stratCounts) {
    winRatePerStrategy[stratId] = stratCounts[stratId].total > 0 ?
      (stratCounts[stratId].win / stratCounts[stratId].total) * 100 : 0;
    avgRRPerStrategy[stratId] = rrPerStrategy[stratId] && rrPerStrategy[stratId].length > 0
      ? rrPerStrategy[stratId].reduce((a, b) => a + b, 0) / rrPerStrategy[stratId].length
      : 0;
  }

  // Checklist completion vs outcome
  let withChecklist = { win: 0, total: 0 };
  let withoutChecklist = { win: 0, total: 0 };
  if (checklistCompletion) {
    trades.forEach(trade => {
      const completed = checklistCompletion[trade.id];
      if (completed) {
        withChecklist.total++;
        if (trade.result === 'WIN') withChecklist.win++;
      } else {
        withoutChecklist.total++;
        if (trade.result === 'WIN') withoutChecklist.win++;
      }
    });
  }
  const checklistCompletionVsOutcome = {
    withChecklist: {
      winRate: withChecklist.total > 0 ? (withChecklist.win / withChecklist.total) * 100 : 0,
      count: withChecklist.total
    },
    withoutChecklist: {
      winRate: withoutChecklist.total > 0 ? (withoutChecklist.win / withoutChecklist.total) * 100 : 0,
      count: withoutChecklist.total
    }
  };

  // Consistency in execution (time, pair)
  const hourCounts: Record<string, number> = {};
  const pairCounts: Record<string, number> = {};
  trades.forEach(trade => {
    if (trade.created_at) {
      const hour = new Date(trade.created_at).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
    if (trade.pair) {
      pairCounts[trade.pair] = (pairCounts[trade.pair] || 0) + 1;
    }
  });
  const mostCommonTime = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const mostCommonPair = Object.entries(pairCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Trade frequency (monthly)
  const monthly: Record<string, number> = {};
  trades.forEach(trade => {
    if (trade.created_at) {
      const month = new Date(trade.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
      monthly[month] = (monthly[month] || 0) + 1;
    }
  });

  // Average holding duration (in hours)
  let totalDuration = 0;
  let durationCount = 0;
  trades.forEach(trade => {
    if (trade.entry_price && trade.exit_price && trade.created_at && trade.updated_at) {
      const start = new Date(trade.created_at).getTime();
      const end = new Date(trade.updated_at).getTime();
      if (end > start) {
        totalDuration += (end - start) / (1000 * 60 * 60);
        durationCount++;
      }
    }
  });
  const avgHoldingDuration = durationCount > 0 ? totalDuration / durationCount : 0;

  // Scoring rubric
  // Example: Use win rate, R:R, and consistency to label
  let label = 'Consistent';
  const allWinRates = Object.values(winRatePerStrategy);
  const allRRs = Object.values(avgRRPerStrategy);
  const overallWinRate = allWinRates.length > 0 ? allWinRates.reduce((a, b) => a + b, 0) / allWinRates.length : 0;
  const overallRR = allRRs.length > 0 ? allRRs.reduce((a, b) => a + b, 0) / allRRs.length : 0;
  if (overallWinRate > 65 && overallRR > 2) label = 'Excellent';
  else if (overallWinRate > 55 && overallRR > 1.5) label = 'Improving';
  else if (overallWinRate < 40) label = 'Declining';
  else if (allWinRates.some(wr => Math.abs(wr - overallWinRate) > 20)) label = 'Volatile';

  // Insights
  const insights: string[] = [];
  // Highest win rate strategy
  const bestStratId = Object.entries(winRatePerStrategy).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (bestStratId) {
    const strat = strategies.find(s => s.id === bestStratId);
    if (strat) insights.push(`Your highest win rate comes from ${strat.name}.`);
  }
  // Checklist completion outperform
  if (checklistCompletionVsOutcome.withChecklist.count > 0 && checklistCompletionVsOutcome.withChecklist.winRate > checklistCompletionVsOutcome.withoutChecklist.winRate) {
    const diff = checklistCompletionVsOutcome.withChecklist.winRate - checklistCompletionVsOutcome.withoutChecklist.winRate;
    insights.push(`Trades with full checklist completion outperform others by ${diff.toFixed(1)}%.`);
  }
  // R:R improvement
  if (trades.length > 10) {
    const last10 = trades.slice(-10);
    const prev10 = trades.slice(-20, -10);
    const last10RR = last10.map(calcRR).filter((v): v is number => v !== null);
    const prev10RR = prev10.map(calcRR).filter((v): v is number => v !== null);
    if (last10RR.length && prev10RR.length) {
      const lastAvg = last10RR.reduce((a, b) => a + b, 0) / last10RR.length;
      const prevAvg = prev10RR.reduce((a, b) => a + b, 0) / prev10RR.length;
      if (lastAvg > prevAvg) {
        insights.push(`Your risk-to-reward ratio has improved over the past 10 trades.`);
      }
    }
  }

  return {
    winRatePerStrategy,
    avgRRPerStrategy,
    checklistCompletionVsOutcome,
    executionConsistency: {
      mostCommonTime: mostCommonTime ? `${mostCommonTime}:00` : null,
      mostCommonPair,
    },
    tradeFrequency: { monthly },
    avgHoldingDuration,
    label,
    insights,
  };
} 