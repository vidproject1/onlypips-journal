
import React from 'react';
import { Database } from '@/integrations/supabase/types';

type Trade = Database['public']['Tables']['trades']['Row'];

interface MetricsGridProps {
  trades: Trade[];
}

const MetricsGrid: React.FC<MetricsGridProps> = ({ trades }) => {
  const winningTrades = trades.filter(trade => Number(trade.profit_loss) > 0);
  const losingTrades = trades.filter(trade => Number(trade.profit_loss) < 0);
  
  const avgWin = winningTrades.length > 0 ? 
    winningTrades.reduce((sum, trade) => sum + Number(trade.profit_loss), 0) / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? 
    Math.abs(losingTrades.reduce((sum, trade) => sum + Number(trade.profit_loss), 0) / losingTrades.length) : 0;
  
  const largestWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => Number(t.profit_loss))) : 0;
  const largestLoss = losingTrades.length > 0 ? Math.min(...losingTrades.map(t => Number(t.profit_loss))) : 0;

  const MetricItem = ({ label, value, positive }: { label: string, value: string, positive?: boolean }) => (
    <div className="flex flex-col p-6 rounded-3xl bg-background border border-border/10">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{label}</span>
      <span className={`text-2xl font-light tracking-tight ${
        positive === true ? 'text-emerald-500' : 
        positive === false ? 'text-rose-500' : 
        'text-foreground'
      }`}>
        {value}
      </span>
    </div>
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricItem 
        label="Average Win" 
        value={`+$${avgWin.toFixed(2)}`}
        positive={true}
      />
      <MetricItem 
        label="Average Loss" 
        value={`-$${avgLoss.toFixed(2)}`}
        positive={false}
      />
      <MetricItem 
        label="Largest Win" 
        value={`+$${largestWin.toFixed(2)}`}
        positive={true}
      />
      <MetricItem 
        label="Largest Loss" 
        value={`-$${Math.abs(largestLoss).toFixed(2)}`}
        positive={false}
      />
    </div>
  );
};

export default MetricsGrid;
