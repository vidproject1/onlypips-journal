import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TradeEntryForm from './TradeEntryForm';
import GrowthChart from './GrowthChart';

interface GrowthPlan {
  id: string;
  starting_balance: number;
  target_balance: number;
  current_balance: number;
  risk_level: string;
  risk_percentage: number;
  estimated_trades: number;
  profit_per_trade: number;
  risk_per_trade: number;
  trades_completed: number;
  is_active: boolean;
  created_at: string;
}

interface GrowthTrade {
  id: string;
  trade_date: string;
  actual_profit_loss: number;
  hit_target: boolean;
  notes: string | null;
}

interface GrowthPlanDashboardProps {
  plan: GrowthPlan;
  onPlanUpdated: () => void;
  onPlanReset: () => void;
}

const GrowthPlanDashboard: React.FC<GrowthPlanDashboardProps> = ({ 
  plan, 
  onPlanUpdated,
  onPlanReset 
}) => {
  const [trades, setTrades] = useState<GrowthTrade[]>([]);
  const [showTradeForm, setShowTradeForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrades();
  }, [plan.id]);

  const fetchTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('growth_plan_trades')
        .select('*')
        .eq('growth_plan_id', plan.id)
        .order('trade_date', { ascending: false });

      if (error) throw error;
      setTrades(data || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const handleTradeAdded = () => {
    fetchTrades();
    onPlanUpdated();
    setShowTradeForm(false);
    toast({
      title: "Trade Recorded",
      description: "Your trade has been added to the growth plan",
    });
  };

  const balanceProgress = ((plan.current_balance - plan.starting_balance) / (plan.target_balance - plan.starting_balance)) * 100;
  const tradesProgress = (plan.trades_completed / plan.estimated_trades) * 100;
  
  const remainingAmount = plan.target_balance - plan.current_balance;
  const remainingTrades = Math.max(0, plan.estimated_trades - plan.trades_completed);
  
  // Recalculate based on current balance
  const updatedRiskPerTrade = plan.current_balance * (plan.risk_percentage / 100);
  const updatedProfitPerTrade = remainingTrades > 0 ? remainingAmount / remainingTrades : 0;

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Plan Overview */}
      <div className="bg-background rounded-3xl border border-border/10 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-light tracking-tight">Your Growth Plan</h2>
            <div className="flex items-center gap-3 mt-3">
              <Badge className={`${getRiskLevelColor(plan.risk_level)} px-3 py-1 rounded-full font-normal`}>
                {plan.risk_level} Risk ({plan.risk_percentage}%)
              </Badge>
              <span className="text-sm text-muted-foreground font-light">
                Started {new Date(plan.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <Button variant="outline" onClick={onPlanReset} className="mt-4 md:mt-0 rounded-full border-border/20 hover:bg-muted/30 font-normal">
            Reset Plan
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="text-center p-4 bg-background rounded-3xl border border-border/10 shadow-sm">
            <p className="text-3xl font-light tracking-tight">${plan.current_balance.toFixed(2)}</p>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-1">Current Balance</p>
          </div>
          <div className="text-center p-4 bg-background rounded-3xl border border-border/10 shadow-sm">
            <p className="text-3xl font-light tracking-tight">${plan.target_balance.toFixed(2)}</p>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-1">Target Balance</p>
          </div>
          <div className="text-center p-4 bg-background rounded-3xl border border-border/10 shadow-sm">
            <p className="text-3xl font-light tracking-tight">{plan.trades_completed}</p>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-1">Trades Completed</p>
          </div>
          <div className="text-center p-4 bg-background rounded-3xl border border-border/10 shadow-sm">
            <p className="text-3xl font-light tracking-tight">{remainingTrades}</p>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-1">Trades Remaining</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2 font-light">
              <span>Balance Progress</span>
              <span>{balanceProgress.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(balanceProgress, 100)} className="h-1.5 rounded-full" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2 font-light">
              <span>Trades Progress</span>
              <span>{tradesProgress.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(tradesProgress, 100)} className="h-1.5 rounded-full" />
          </div>
        </div>
      </div>

      {/* Updated Calculations */}
      <div className="bg-background rounded-3xl border border-border/10 p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-light tracking-tight">Updated Targets</h2>
          <p className="text-sm text-muted-foreground mt-1">Dynamic calculations based on your current progress</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
            <p className="text-2xl font-medium text-emerald-600 dark:text-emerald-400">${updatedProfitPerTrade.toFixed(2)}</p>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-2">Profit Per Trade Needed</p>
          </div>
          <div className="text-center p-6 bg-rose-500/5 rounded-3xl border border-rose-500/10">
            <p className="text-2xl font-medium text-rose-600 dark:text-rose-400">${updatedRiskPerTrade.toFixed(2)}</p>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-2">Risk Per Trade</p>
          </div>
          <div className="text-center p-6 bg-blue-500/5 rounded-3xl border border-blue-500/10">
            <p className="text-2xl font-medium text-blue-600 dark:text-blue-400">${remainingAmount.toFixed(2)}</p>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-2">Remaining to Goal</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-background rounded-3xl border border-border/10 p-1 shadow-sm overflow-hidden">
        <GrowthChart plan={plan} trades={trades} />
      </div>

      {/* Trade Entry */}
      <div className="bg-background rounded-3xl border border-border/10 p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-light tracking-tight">Record Today's Trade</h2>
        </div>
        <div>
          {!showTradeForm ? (
            <Button 
              onClick={() => setShowTradeForm(true)} 
              className="w-full rounded-full h-12 text-base font-medium shadow-sm hover:shadow-md transition-all"
            >
              Add Trade Result
            </Button>
          ) : (
            <TradeEntryForm
              planId={plan.id}
              targetProfit={updatedProfitPerTrade}
              onTradeAdded={handleTradeAdded}
              onCancel={() => setShowTradeForm(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GrowthPlanDashboard;
