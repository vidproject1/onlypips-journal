import React, { useEffect, useState } from 'react';
import TradeStats from '@/components/Dashboard/TradeStats';
import MetricsGrid from '@/components/Dashboard/MetricsGrid';
import AdvancedCharts from '@/components/Dashboard/AdvancedCharts';
import TradingHeatmap from '@/components/Dashboard/TradingHeatmap';
import PerformanceMetrics from '@/components/Dashboard/PerformanceMetrics';
import MonthlyRecap from '@/components/Dashboard/MonthlyRecap';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import PerformanceReportCard from '@/components/Dashboard/PerformanceReportCard';
import { analyzePerformance } from '@/lib/performanceReport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardProps {
  userId: string;
  accountType?: "real" | "demo";
  accountName?: string;
}

type Account = Database['public']['Tables']['accounts']['Row'];
type Trade = Database['public']['Tables']['trades']['Row'];

const Dashboard: React.FC<DashboardProps> = ({ userId, accountType, accountName }) => {
  const params = useParams();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const navigate = useNavigate();
  const [strategies, setStrategies] = useState<any[]>([]);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [strategyNames, setStrategyNames] = useState<Record<string, string>>({});
  const isPro = true;
  const location = useLocation();

  const effectiveType = accountType || params.accountType;
  const effectiveName = accountName || params.accountName;

  const fetchAccountAndTrades = async () => {
    if (!effectiveType || !effectiveName) {
      navigate("/accounts");
      return;
    }

    setIsLoading(true);
    const safeAccountName = decodeURIComponent(effectiveName);
    
    const { data: acc, error: accErr } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("type", effectiveType.toUpperCase())
      .eq("name", safeAccountName)
      .maybeSingle();

    if (accErr || !acc) {
      console.error("Account fetch error:", accErr);
      setAccount(null);
      setTrades([]);
      setIsLoading(false);
      return;
    }

    setAccount(acc);

    const { data: trs, error: trErr } = await supabase
      .from("trades")
      .select("*")
      .eq("account_id", acc.id)
      .order("created_at", { ascending: false });

    if (trErr) {
      console.error("Trades fetch error:", trErr);
    } else {
      setTrades(trs || []);
      setLastUpdated(new Date());
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAccountAndTrades();
  }, [userId, effectiveType, effectiveName]);

  useEffect(() => {
    if (!account) return;

    const channel = supabase
      .channel('trades-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trades',
          filter: `account_id=eq.${account.id}`
        },
        (payload) => {
          console.log('Real-time trade update:', payload);
          fetchAccountAndTrades();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [account?.id]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: tradeData } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId);
      setTrades(tradeData || []);
      const { data: stratData } = await supabase
        .from('strategies')
        .select('*')
        .eq('user_id', userId);
      setStrategies(stratData || []);
      setStrategyNames(
        (stratData || []).reduce((acc: any, s: any) => {
          acc[s.id] = s.name;
          return acc;
        }, {})
      );
    };
    fetchData();
  }, [userId]);

  useEffect(() => {
    if (location.search.includes('report=1')) {
      const report = analyzePerformance(trades, strategies);
      setReportData(report);
      setReportOpen(true);
    }
  }, [location.search, trades, strategies]);

  const handleGenerateReport = () => {
    const report = analyzePerformance(trades, strategies);
    setReportData(report);
    setReportOpen(true);
  };

  if (!effectiveType || !effectiveName) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1600px] mx-auto p-8 space-y-12">
        {/* Header Section */}
        <div className="flex items-end justify-between border-b border-border/40 pb-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-light tracking-tight text-foreground">
              {account ? account.name : "Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground font-light">
              {account
                ? `${account.type} Account`
                : "Account not found."}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Trades</p>
            <p className="text-3xl font-light">{trades.length}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        ) : (
          account && (
            <div className="space-y-16">
              {/* Quick Stats Summary */}
              <div className="animate-in fade-in duration-500">
                 <TradeStats trades={trades} />
              </div>

              <Tabs defaultValue="overview" className="space-y-8">
                <TabsList className="w-full justify-start border-b border-border/40 bg-transparent p-0 h-auto rounded-none">
                  <TabsTrigger 
                    value="overview" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground transition-colors"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="analysis"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground transition-colors"
                  >
                    Analysis
                  </TabsTrigger>
                  <TabsTrigger 
                    value="performance"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground transition-colors"
                  >
                    Metrics
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground transition-colors"
                  >
                    History
                  </TabsTrigger>
                </TabsList>
                
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid gap-12 lg:grid-cols-2">
                    <MonthlyRecap trades={trades} />
                    <MetricsGrid trades={trades} />
                  </div>
                </TabsContent>

                {/* Analysis Tab */}
                <TabsContent value="analysis" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {trades.length >= 5 ? (
                     <AdvancedCharts trades={trades} />
                  ) : (
                    <div className="flex items-center justify-center h-48 text-muted-foreground font-light text-sm border border-dashed border-border/50 rounded-3xl">
                      Need at least 5 trades to show advanced analysis
                    </div>
                  )}
                  {trades.length >= 15 && <TradingHeatmap trades={trades} />}
                </TabsContent>

                {/* Metrics Tab */}
                <TabsContent value="performance" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {trades.length >= 10 ? (
                    <PerformanceMetrics trades={trades} />
                  ) : (
                    <div className="flex items-center justify-center h-48 text-muted-foreground font-light text-sm border border-dashed border-border/50 rounded-3xl">
                      Need at least 10 trades to show detailed performance metrics
                    </div>
                  )}
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid gap-4">
                    {trades.map((trade) => (
                      <div 
                        key={trade.id} 
                        className="group flex items-center justify-between p-4 rounded-3xl hover:bg-muted/30 transition-colors border border-transparent hover:border-border/40"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-1 h-12 rounded-full ${
                            trade.result === 'WIN' ? 'bg-emerald-500' : 
                            trade.result === 'LOSS' ? 'bg-rose-500' : 
                            'bg-neutral-500'
                          }`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{trade.pair}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                trade.direction === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                              }`}>
                                {trade.direction}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(trade.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-8 text-sm">
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">Entry</div>
                            <div className="font-light">{trade.entry_price}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">Exit</div>
                            <div className="font-light">{trade.exit_price}</div>
                          </div>
                          <div className="text-right w-24">
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">P/L</div>
                            <div className={`font-medium ${Number(trade.profit_loss) > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {Number(trade.profit_loss) > 0 ? '+' : ''}{trade.profit_loss}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              {isPro && (
                <div className="flex justify-end pt-8 border-t border-border/40">
                  <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                    <DialogTrigger asChild>
                      <button className="text-sm text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4" onClick={handleGenerateReport}>
                        Generate Report
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      {reportData && (
                        <PerformanceReportCard report={reportData} strategyNames={strategyNames} />
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Dashboard;
