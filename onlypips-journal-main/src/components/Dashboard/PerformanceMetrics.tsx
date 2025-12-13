
import React from 'react';
import { Database } from '@/integrations/supabase/types';

type Trade = Database['public']['Tables']['trades']['Row'];

interface PerformanceMetricsProps {
  trades: Trade[];
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ trades }) => {
  const winningTrades = trades.filter(trade => Number(trade.profit_loss) > 0);
  const losingTrades = trades.filter(trade => Number(trade.profit_loss) < 0);
  
  const totalWins = winningTrades.reduce((sum, trade) => sum + Number(trade.profit_loss), 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + Number(trade.profit_loss), 0));
  
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 3 : 0;
  
  const returns = trades.map(trade => Number(trade.profit_loss));
  const avgReturn = returns.length > 0 ? returns.reduce((sum, ret) => sum + ret, 0) / returns.length : 0;
  const variance = returns.length > 0 ? returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length : 0;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;
  
  let peak = 0;
  let maxDrawdown = 0;
  let runningPnL = 0;
  
  trades.forEach(trade => {
    runningPnL += Number(trade.profit_loss);
    if (runningPnL > peak) peak = runningPnL;
    const drawdown = peak - runningPnL;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  });
  
  const maxDrawdownPercent = peak > 0 ? (maxDrawdown / peak) * 100 : 0;
  
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
  const profitFactorScore = Math.min(profitFactor * 20, 40);
  const drawdownScore = Math.max(30 - maxDrawdownPercent, 0);
  const winRateScore = winRate * 0.3;
  
  const consistencyScore = Math.min(Math.max(profitFactorScore + drawdownScore + winRateScore, 0), 100);
  
  const metrics = [
    {
      label: "Profit Factor",
      value: profitFactor.toFixed(2),
      description: "Gross Profit / Gross Loss",
    },
    {
      label: "Sharpe Ratio",
      value: sharpeRatio.toFixed(2),
      description: "Risk-Adjusted Return",
    },
    {
      label: "Max Drawdown",
      value: `${maxDrawdownPercent.toFixed(1)}%`,
      description: "Peak-to-Trough Decline",
    },
    {
      label: "Consistency",
      value: `${Math.round(consistencyScore)}%`,
      description: "Overall Score",
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
      {metrics.map((metric) => (
        <div key={metric.label} className="flex flex-col space-y-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{metric.label}</span>
          <span className="text-3xl font-light tracking-tight text-foreground">
            {metric.value}
          </span>
          <span className="text-xs text-muted-foreground font-light">{metric.description}</span>
        </div>
      ))}
    </div>
  );
};

export default PerformanceMetrics;
