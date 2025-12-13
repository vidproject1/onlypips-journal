
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Database } from '@/integrations/supabase/types';

type Trade = Database['public']['Tables']['trades']['Row'];

interface AdvancedChartsProps {
  trades: Trade[];
}

const AdvancedCharts: React.FC<AdvancedChartsProps> = ({ trades }) => {
  const cumulativePnL = trades
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .reduce((acc, trade, index) => {
      const prevValue = index > 0 ? acc[index - 1].cumulative : 0;
      acc.push({
        trade: index + 1,
        pnl: Number(trade.profit_loss),
        cumulative: prevValue + Number(trade.profit_loss),
        date: new Date(trade.created_at).toLocaleDateString()
      });
      return acc;
    }, [] as any[]);

  // Calculate P&L Distribution
  const pnlValues = trades.map(t => Number(t.profit_loss));
  const maxPnl = Math.max(...pnlValues);
  const minPnl = Math.min(...pnlValues);
  const range = maxPnl - minPnl;
  const binCount = 10;
  const binSize = range / binCount;

  const distributionData = Array.from({ length: binCount }, (_, i) => {
    const binStart = minPnl + (i * binSize);
    const binEnd = binStart + binSize;
    const count = pnlValues.filter(v => v >= binStart && (i === binCount - 1 ? v <= binEnd : v < binEnd)).length;
    return {
      range: `${binStart.toFixed(0)} to ${binEnd.toFixed(0)}`,
      count,
      isPositive: (binStart + binEnd) / 2 > 0
    };
  }).filter(d => d.count > 0);

  if (cumulativePnL.length === 0) return null;

  return (
    <div className="space-y-12">
      {/* Equity Curve */}
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Equity Curve</h3>
        </div>
        <div className="h-[300px] w-full p-4 rounded-2xl bg-muted/30 border border-border/10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cumulativePnL}>
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="trade" 
                hide={true} 
              />
              <YAxis 
                hide={false} 
                orientation="right"
                tick={{fill: '#737373', fontSize: 10}}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#09090b', 
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                itemStyle={{ color: '#e4e4e7' }}
                labelStyle={{ color: '#a1a1aa' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Equity']}
              />
              <Area 
                type="monotone" 
                dataKey="cumulative" 
                stroke="#10b981" 
                strokeWidth={2}
                fill="url(#equityGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* P&L Distribution */}
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Result Distribution</h3>
        </div>
        <div className="h-[250px] w-full p-4 rounded-2xl bg-muted/30 border border-border/10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData}>
              <XAxis 
                dataKey="range" 
                hide={true}
              />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ 
                  backgroundColor: '#09090b', 
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                itemStyle={{ color: '#e4e4e7' }}
                labelStyle={{ color: '#a1a1aa' }}
              />
              <Bar dataKey="count" radius={[4, 4, 4, 4]}>
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isPositive ? '#10b981' : '#f43f5e'} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdvancedCharts;
