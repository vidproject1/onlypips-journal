
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import GrowthPlanForm from '@/components/GrowthPath/GrowthPlanForm';
import GrowthPlanDashboard from '@/components/GrowthPath/GrowthPlanDashboard';

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

interface GrowthPathProps {
  userId: string;
}

const GrowthPath: React.FC<GrowthPathProps> = ({ userId }) => {
  const [currentPlan, setCurrentPlan] = useState<GrowthPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchActivePlan();
  }, [userId]);

  const fetchActivePlan = async () => {
    try {
      const { data, error } = await supabase
        .from('growth_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      setCurrentPlan(data?.[0] || null);
    } catch (error) {
      console.error('Error fetching growth plan:', error);
      toast({
        title: "Error",
        description: "Failed to load your growth plan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlanCreated = (plan: GrowthPlan) => {
    setCurrentPlan(plan);
    toast({
      title: "Success",
      description: "Your growth plan has been created!",
    });
  };

  const handlePlanReset = async () => {
    if (!currentPlan) return;

    try {
      await supabase
        .from('growth_plans')
        .update({ is_active: false })
        .eq('id', currentPlan.id);

      setCurrentPlan(null);
      toast({
        title: "Plan Reset",
        description: "Your growth plan has been reset. You can create a new one.",
      });
    } catch (error) {
      console.error('Error resetting plan:', error);
      toast({
        title: "Error",
        description: "Failed to reset your growth plan",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl animate-fade-in">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-light tracking-tight mb-3">Growth Path</h1>
        <p className="text-muted-foreground text-lg font-light">
          Systematically grow your trading account with calculated progression
        </p>
      </div>

      {!currentPlan ? (
        <div className="max-w-xl mx-auto">
          <div className="bg-background rounded-3xl border border-border/10 p-8 shadow-sm">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-light tracking-tight">Create Your Growth Plan</h2>
              <p className="text-sm text-muted-foreground mt-2">Define your starting point and financial goals</p>
            </div>
            <GrowthPlanForm userId={userId} onPlanCreated={handlePlanCreated} />
          </div>
        </div>
      ) : (
        <GrowthPlanDashboard 
          plan={currentPlan} 
          onPlanUpdated={fetchActivePlan}
          onPlanReset={handlePlanReset}
        />
      )}
    </div>
  );
};

export default GrowthPath;
