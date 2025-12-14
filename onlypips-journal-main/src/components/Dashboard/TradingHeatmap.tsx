
import React from 'react';
import { Database } from '@/integrations/supabase/types';

type Trade = Database['public']['Tables']['trades']['Row'];

interface TradingHeatmapProps {
  trades: Trade[];
}

const TradingHeatmap: React.FC<TradingHeatmapProps> = ({ trades }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Create heatmap data with proper error handling
  const heatmapData = days.map(day => 
    hours.map(hour => {
      const dayTrades = trades.filter(trade => {
        try {
          const tradeDate = new Date(trade.created_at);
          const tradeDayName = tradeDate.toLocaleDateString('en-US', { weekday: 'short' });
          const tradeHour = tradeDate.getHours();
          return tradeDayName === day && tradeHour === hour;
        } catch (error) {
          console.error('Error parsing trade date:', error);
          return false;
        }
      });
      
      const totalPnL = dayTrades.reduce((sum, trade) => {
        const pnl = Number(trade.profit_loss);
        return sum + (isNaN(pnl) ? 0 : pnl);
      }, 0);
      const tradeCount = dayTrades.length;
      
      return {
        day,
        hour,
        trades: tradeCount,
        pnl: totalPnL,
        intensity: tradeCount > 0 ? Math.min(tradeCount / 5, 1) : 0
      };
    })
  );

  // Show message if insufficient data
  if (trades.length < 15) {
    return (
      <div className="w-full space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Trading Activity</h3>
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border/50 rounded-lg">
          <p className="text-muted-foreground font-light">
            Need at least 15 trades to generate trading patterns heatmap
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Current trades: {trades.length}/15
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Trading Activity</h3>
        <p className="text-xs text-muted-foreground">
          {trades.length} trades recorded
        </p>
      </div>
      
      <div className="p-6 rounded-3xl bg-background border border-border/10">
        <div className="space-y-2">
          {/* Hour labels */}
          <div className="grid grid-cols-25 gap-1 mb-2">
            <div className="text-xs text-muted-foreground"></div>
            {hours.map(hour => (
              <div key={hour} className="text-[10px] text-muted-foreground text-center w-4">
                {hour % 4 === 0 ? hour : ''}
              </div>
            ))}
          </div>
          
          {/* Heatmap grid */}
          {heatmapData.map((dayData, dayIndex) => (
            <div key={days[dayIndex]} className="grid grid-cols-25 gap-1">
              <div className="text-[10px] font-medium text-muted-foreground text-right pr-2 flex items-center justify-end">
                {days[dayIndex]}
              </div>
              {dayData.map((cellData, hourIndex) => (
                <div
                  key={`${dayIndex}-${hourIndex}`}
                  className={`w-4 h-4 rounded-[2px] transition-all duration-300 ${
                    cellData.intensity === 0 
                      ? 'bg-muted-foreground/10' 
                      : cellData.pnl > 0 
                        ? `bg-emerald-500` 
                        : cellData.pnl < 0 
                          ? `bg-rose-500` 
                          : `bg-blue-500`
                  }`}
                  style={{
                    opacity: cellData.intensity === 0 ? 1 : 0.3 + (cellData.intensity * 0.7)
                  }}
                  title={`${days[dayIndex]} ${cellData.hour}:00 - ${cellData.trades} trades, P&L: ${cellData.pnl.toFixed(2)}`}
                />
              ))}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-end mt-6 text-[10px] text-muted-foreground gap-4">
          <div className="flex items-center gap-2">
            <span>Win</span>
            <div className="flex gap-0.5">
              <div className="w-2 h-2 bg-emerald-500 opacity-30 rounded-[1px]"></div>
              <div className="w-2 h-2 bg-emerald-500 opacity-60 rounded-[1px]"></div>
              <div className="w-2 h-2 bg-emerald-500 opacity-100 rounded-[1px]"></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span>Loss</span>
            <div className="flex gap-0.5">
              <div className="w-2 h-2 bg-rose-500 opacity-30 rounded-[1px]"></div>
              <div className="w-2 h-2 bg-rose-500 opacity-60 rounded-[1px]"></div>
              <div className="w-2 h-2 bg-rose-500 opacity-100 rounded-[1px]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingHeatmap;
