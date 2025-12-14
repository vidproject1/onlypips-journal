
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database } from '@/integrations/supabase/types';

type Trade = Database['public']['Tables']['trades']['Row'];

interface MonthlyRecapProps {
  trades: Trade[];
}

const MonthlyRecap: React.FC<MonthlyRecapProps> = ({ trades }) => {
  const availableMonths = React.useMemo(() => {
    const monthsSet = new Set<string>();
    
    trades.forEach(trade => {
      const tradeDate = new Date(trade.created_at);
      const monthYear = tradeDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      monthsSet.add(monthYear);
    });
    
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    monthsSet.add(currentMonth);
    
    return Array.from(monthsSet).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateB.getTime() - dateA.getTime();
    });
  }, [trades]);

  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  );

  const selectedMonthTrades = trades.filter(trade => {
    const tradeDate = new Date(trade.created_at);
    const tradeMonth = tradeDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return tradeMonth === selectedMonth;
  });

  const totalTrades = selectedMonthTrades.length;
  const wins = selectedMonthTrades.filter(trade => trade.result === 'WIN').length;
  const losses = selectedMonthTrades.filter(trade => trade.result === 'LOSS').length;
  const breakEven = selectedMonthTrades.filter(trade => trade.result === 'BREAK EVEN' || trade.is_break_even).length;
  
  const tradesExcludingBreakEven = totalTrades - breakEven;
  const winRate = tradesExcludingBreakEven > 0 ? Math.round((wins / tradesExcludingBreakEven) * 100) : 0;
  
  const totalPnL = selectedMonthTrades.reduce((sum, trade) => sum + Number(trade.profit_loss), 0);

  const StatBox = ({ label, value, subValue, highlight }: { label: string, value: string, subValue?: string, highlight?: boolean }) => (
    <div className="flex flex-col p-6 rounded-3xl bg-background border border-border/10">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{label}</span>
      <span className={`text-2xl font-light tracking-tight ${highlight ? (Number(value.replace(/[^0-9.-]/g, '')) >= 0 ? 'text-emerald-500' : 'text-rose-500') : 'text-foreground'}`}>
        {value}
      </span>
      {subValue && <span className="text-xs text-muted-foreground mt-1 font-light">{subValue}</span>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Monthly Performance</h3>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-40 h-8 text-xs border-none bg-transparent hover:bg-muted/50 focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableMonths.map((month) => (
              <SelectItem key={month} value={month}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {totalTrades === 0 ? (
        <div className="py-12 text-center text-muted-foreground text-sm font-light">
          No trades recorded for {selectedMonth}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatBox 
            label="Net P&L" 
            value={`${totalPnL >= 0 ? '$' : '-$'}${Math.abs(totalPnL).toFixed(2)}`}
            highlight
          />
          <StatBox 
            label="Win Rate" 
            value={`${winRate}%`}
            subValue={`${wins}W - ${losses}L - ${breakEven}BE`}
          />
          <StatBox 
            label="Volume" 
            value={totalTrades.toString()}
            subValue="Trades"
          />
          <StatBox 
            label="Avg P&L" 
            value={`${totalTrades > 0 ? (totalPnL >= 0 ? '$' : '-$') + Math.abs(totalPnL / totalTrades).toFixed(2) : '$0.00'}`}
            highlight
          />
        </div>
      )}
    </div>
  );
};

export default MonthlyRecap;
