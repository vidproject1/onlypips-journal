import React from 'react';
import StatsCard from './StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivitySquare, BarChart3, Percent, TrendingUp } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import EquityCurveChart from './analytics/EquityCurveChart';
import WinLossPieChart from './analytics/WinLossPieChart';
import ProfitFactorStats from './analytics/ProfitFactorStats';
import MostTradedPairsBarChart from './analytics/MostTradedPairsBarChart';
import AverageGainLossLineChart from './analytics/AverageGainLossLineChart';

type Trade = Database['public']['Tables']['trades']['Row'];

interface TradeStatsProps {
  trades: Trade[];
}

const TradeStats: React.FC<TradeStatsProps> = ({ trades }) => {
  // Calculate stats
  const totalTrades = trades.length;
  const wins = trades.filter(trade => trade.result === 'WIN').length;
  const losses = trades.filter(trade => trade.result === 'LOSS').length;
  const breakEven = trades.filter(trade => trade.result === 'BREAK EVEN' || trade.is_break_even).length;
  const tradesExcludingBreakEven = totalTrades - breakEven;
  const winRate = tradesExcludingBreakEven > 0 ? Math.round((wins / tradesExcludingBreakEven) * 100) : 0;
  const totalProfitLoss = trades.reduce((total, trade) => total + Number(trade.profit_loss), 0);
  const avgProfitLossNumber = totalTrades > 0 ? totalProfitLoss / totalTrades : 0;
  const avgProfitLoss = avgProfitLossNumber.toFixed(1);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Trades"
          value={totalTrades}
          icon={<ActivitySquare className="h-4 w-4" />}
          delay={100}
        />
        <StatsCard 
          title="Win Rate"
          value={`${winRate}%`}
          description={`${wins} wins out of ${tradesExcludingBreakEven} trades (excl. break-even)`}
          icon={<Percent className="h-4 w-4" />}
          delay={200}
        />
        <StatsCard 
          title="Average P/L"
          value={`${avgProfitLossNumber > 0 ? '+' : ''}${avgProfitLoss}`}
          description="Average profit/loss per trade"
          icon={<TrendingUp className="h-4 w-4" />}
          delay={300}
        />
        <StatsCard 
          title="Performance"
          value={winRate > 50 ? 'Profitable' : winRate > 40 ? 'Neutral' : 'Needs Work'}
          description={`Total P/L: ${totalProfitLoss > 0 ? '+' : ''}${totalProfitLoss.toFixed(1)}`}
          icon={<BarChart3 className="h-4 w-4" />}
          delay={400}
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <EquityCurveChart trades={trades} />
        <WinLossPieChart trades={trades} />
        <ProfitFactorStats trades={trades} />
        <MostTradedPairsBarChart trades={trades} />
        <AverageGainLossLineChart trades={trades} />
      </div>
    </div>
  );
};

export default TradeStats;
