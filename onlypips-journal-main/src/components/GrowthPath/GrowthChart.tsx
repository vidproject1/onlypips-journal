
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface GrowthPlan {
  starting_balance: number;
  target_balance: number;
  current_balance: number;
  created_at: string;
}

interface GrowthTrade {
  trade_date: string;
  actual_profit_loss: number;
}

interface GrowthChartProps {
  plan: GrowthPlan;
  trades: GrowthTrade[];
}

const GrowthChart: React.FC<GrowthChartProps> = ({ plan, trades }) => {
  const chartData = React.useMemo(() => {
    const data = [
      {
        date: new Date(plan.created_at).toLocaleDateString(),
        balance: plan.starting_balance,
        target: plan.target_balance
      }
    ];

    let runningBalance = plan.starting_balance;
    
    trades
      .sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime())
      .forEach((trade) => {
        runningBalance += trade.actual_profit_loss;
        data.push({
          date: new Date(trade.trade_date).toLocaleDateString(),
          balance: runningBalance,
          target: plan.target_balance
        });
      });

    return data;
  }, [plan, trades]);

  const chartConfig = {
    balance: {
      label: "Balance",
      color: "hsl(var(--primary))",
    },
    target: {
      label: "Target",
      color: "hsl(var(--muted-foreground))",
    },
  };

  return (
    <div className="w-full h-full p-4">
      <div className="mb-6">
        <h3 className="text-lg font-medium tracking-tight">Growth Progress</h3>
      </div>
      <div className="w-full">
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <LineChart data={chartData}>
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={['dataMin - 10', 'dataMax + 10']}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="var(--color-balance)"
              strokeWidth={2}
              dot={{ fill: "var(--color-balance)", strokeWidth: 2, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="var(--color-target)"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export default GrowthChart;
