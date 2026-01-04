import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, TrendingUp } from "lucide-react";
import BacktestModal from "./BacktestModal";

type BacktestResult = Database['public']['Tables']['backtest_results']['Row'];

const BacktestList = () => {
  const [strategies, setStrategies] = useState<BacktestResult[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<BacktestResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const { data, error } = await supabase
          .from("backtest_results")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching backtest results:", error);
        } else {
          setStrategies(data || []);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStrategies();
  }, []);

  if (isLoading) {
    return <div className="animate-pulse h-24 bg-muted rounded-lg mb-8"></div>;
  }

  if (strategies.length === 0) {
    return null; // Don't show section if no strategies
  }

  return (
    <div className="mb-12 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold tracking-tight">Backtested Strategies</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {strategies.map((strategy) => (
          <Card 
            key={strategy.id} 
            className="group cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-md bg-card/50 backdrop-blur-sm"
            onClick={() => setSelectedStrategy(strategy)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="truncate mr-2 group-hover:text-primary transition-colors">
                  {strategy.strategy_name}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Badge variant="secondary" className="font-normal">
                  Win Rate: {strategy.win_rate}%
                </Badge>
                <span className="text-xs">
                  {strategy.total_trades} trades
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <BacktestModal 
        strategy={selectedStrategy} 
        isOpen={!!selectedStrategy} 
        onClose={() => setSelectedStrategy(null)} 
      />
    </div>
  );
};

export default BacktestList;
