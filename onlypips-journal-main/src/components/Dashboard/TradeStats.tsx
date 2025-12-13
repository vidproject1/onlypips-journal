
import React from 'react';
import { Database } from '@/integrations/supabase/types';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

type Trade = Database['public']['Tables']['trades']['Row'];

interface TradeStatsProps {
  trades: Trade[];
}

const TradeStats: React.FC<TradeStatsProps> = ({ trades }) => {
  const totalTrades = trades.length;
  const wins = trades.filter(trade => trade.result === 'WIN').length;
  const losses = trades.filter(trade => trade.result === 'LOSS').length;
  const breakEven = trades.filter(trade => trade.result === 'BREAK EVEN' || trade.is_break_even).length;
  
  const tradesExcludingBreakEven = totalTrades - breakEven;
  const winRate = tradesExcludingBreakEven > 0 ? Math.round((wins / tradesExcludingBreakEven) * 100) : 0;
  
  const totalProfitLoss = trades.reduce((total, trade) => {
    return total + Number(trade.profit_loss);
  }, 0);

  const StatItem = ({ label, value, subValue, positive }: { label: string, value: string, subValue?: string, positive?: boolean }) => (
    <div className="flex flex-col space-y-1">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-light tracking-tight ${
          positive === true ? 'text-emerald-500' : 
          positive === false ? 'text-rose-500' : 
          'text-foreground'
        }`}>
          {value}
        </span>
        {subValue && <span className="text-sm text-muted-foreground">{subValue}</span>}
      </div>
    </div>
  );

  return (
    <div className="w-full py-8 border-b border-border/40">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <StatItem 
          label="Net P&L" 
          value={`${totalProfitLoss >= 0 ? '$' : '-$'}${Math.abs(totalProfitLoss).toFixed(2)}`}
          positive={totalProfitLoss > 0}
        />
        <StatItem 
          label="Win Rate" 
          value={`${winRate}%`}
          subValue={`${wins}W - ${losses}L`}
          positive={winRate > 50}
        />
        <StatItem 
          label="Total Trades" 
          value={totalTrades.toString()}
        />
        <StatItem 
          label="Profit Factor" 
          value={calculateProfitFactor(trades).toFixed(2)}
          positive={calculateProfitFactor(trades) > 1.5}
        />
      </div>
    </div>
  );
};

const calculateProfitFactor = (trades: Trade[]) => {
  const grossProfit = trades.reduce((acc, t) => (Number(t.profit_loss) > 0 ? acc + Number(t.profit_loss) : acc), 0);
  const grossLoss = Math.abs(trades.reduce((acc, t) => (Number(t.profit_loss) < 0 ? acc + Number(t.profit_loss) : acc), 0));
  return grossLoss === 0 ? grossProfit : grossProfit / grossLoss;
};

export default TradeStats;
