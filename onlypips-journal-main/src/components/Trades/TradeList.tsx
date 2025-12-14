
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowDownCircle, ArrowUpCircle, ChevronDown, ChevronUp, Image, MinusCircle } from "lucide-react";
import { Database } from '@/integrations/supabase/types';

type Trade = Database['public']['Tables']['trades']['Row'];

interface TradeListProps {
  trades: Trade[];
}

const TradeCard: React.FC<{ trade: Trade }> = ({ trade }) => {
  const [expanded, setExpanded] = useState(false);

  const resultColor = 
    trade.result === 'WIN' ? 'bg-profit/10 text-profit' : 
    trade.result === 'LOSS' ? 'bg-loss/10 text-loss' : 
    'bg-neutral/10 text-neutral';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className={`group mb-3 overflow-hidden transition-all duration-300 rounded-2xl border border-border/10 bg-background hover:bg-muted/30 ${expanded ? 'bg-muted/30 pb-4' : ''}`}>
      <div 
        className="flex justify-between items-center p-5 cursor-pointer" 
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-full ${
            trade.result === 'BREAK EVEN' || trade.is_break_even ? 'bg-muted text-muted-foreground' :
            trade.direction === 'BUY' ? (trade.result === 'WIN' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500') :
            (trade.result === 'WIN' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500')
          }`}>
            {trade.result === 'BREAK EVEN' || trade.is_break_even ? (
              <MinusCircle className="h-4 w-4" />
            ) : trade.direction === 'BUY' ? (
              <ArrowUpCircle className="h-4 w-4" />
            ) : (
              <ArrowDownCircle className="h-4 w-4" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-light tracking-tight">{trade.pair}</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {formatDate(trade.created_at)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge className={`border-none px-3 py-1 text-xs font-medium uppercase tracking-wider rounded-full ${
            trade.result === 'WIN' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 
            trade.result === 'LOSS' ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' : 
            'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}>
            {trade.result}
          </Badge>
          <div className="text-muted-foreground/50 transition-transform duration-300" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className="px-5 pb-2 animate-fade-in">
          <div className="grid md:grid-cols-2 gap-6 pt-2 border-t border-border/10">
            <div className="space-y-3 pt-4">
              <div className="grid grid-cols-2 gap-4">
                {trade.entry_price !== null && trade.entry_price !== undefined && (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Entry</span>
                    <span className="text-sm font-light">{trade.entry_price}</span>
                  </div>
                )}
                {trade.exit_price !== null && trade.exit_price !== undefined && (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Exit</span>
                    <span className="text-sm font-light">{trade.exit_price}</span>
                  </div>
                )}
              </div>
              
              {trade.result !== 'BREAK EVEN' && !trade.is_break_even && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Profit/Loss</span>
                  <span className={`text-xl font-light tracking-tight ${Number(trade.profit_loss) > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {Number(trade.profit_loss) > 0 ? '+' : ''}{trade.profit_loss}
                  </span>
                </div>
              )}
              
              {trade.notes && (
                <div className="flex flex-col pt-2">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Notes</span>
                  <p className="text-sm text-muted-foreground/80 font-light leading-relaxed whitespace-pre-wrap">{trade.notes}</p>
                </div>
              )}
              
              <div className="flex items-center gap-2 pt-2">
                 <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-wider border-border/40 text-muted-foreground">
                   {trade.trade_type}
                 </Badge>
                 {trade.strategy && (
                   <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-wider border-border/40 text-muted-foreground">
                     {trade.strategy}
                   </Badge>
                 )}
              </div>
            </div>
            
            {trade.screenshot_url && (
              <div className="flex justify-center items-center pt-4 md:pt-0">
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="relative w-full h-32 cursor-pointer overflow-hidden rounded-xl border border-border/10 hover:opacity-90 transition-opacity bg-background">
                      <img 
                        src={trade.screenshot_url} 
                        alt={`Chart of ${trade.pair}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="bg-background/80 backdrop-blur-sm p-2 rounded-full shadow-sm">
                          <Image className="h-4 w-4 text-foreground" />
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-transparent shadow-none">
                    <div className="relative rounded-xl overflow-hidden shadow-2xl">
                      <img 
                        src={trade.screenshot_url} 
                        alt={`Chart of ${trade.pair}`}
                        className="w-full h-auto"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TradeList: React.FC<TradeListProps> = ({ trades }) => {
  if (!trades.length) {
    return (
      <div className="text-center py-8 text-muted-foreground animate-fade-in">
        No trades recorded yet. Add your first trade to get started!
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {trades.map((trade) => (
        <TradeCard key={trade.id} trade={trade} />
      ))}
    </div>
  );
};

export default TradeList;
