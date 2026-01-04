import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database } from "@/integrations/supabase/types";

type BacktestResult = Database['public']['Tables']['backtest_results']['Row'];

interface BacktestModalProps {
  strategy: BacktestResult | null;
  isOpen: boolean;
  onClose: () => void;
}

const BacktestModal = ({ strategy, isOpen, onClose }: BacktestModalProps) => {
  if (!strategy) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between mr-8">
            <DialogTitle className="text-2xl font-bold text-primary">
              {strategy.strategy_name}
            </DialogTitle>
            <Badge variant="outline" className="text-sm">
              Tested: {strategy.date_tested}
            </Badge>
          </div>
          <DialogDescription>
            Detailed performance metrics from backtesting results.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
            <div className="p-4 bg-muted/30 rounded-lg text-center border border-border/50">
              <div className="text-sm text-muted-foreground mb-1">Win Rate</div>
              <div className="text-2xl font-bold text-green-500">{strategy.win_rate}%</div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center border border-border/50">
              <div className="text-sm text-muted-foreground mb-1">Risk/Reward</div>
              <div className="text-2xl font-bold text-blue-500">{strategy.risk_reward_ratio}</div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center border border-border/50">
              <div className="text-sm text-muted-foreground mb-1">Consistency</div>
              <div className="text-2xl font-bold text-amber-500">{strategy.consistency_score}/10</div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg text-center border border-border/50">
              <div className="text-sm text-muted-foreground mb-1">Total Trades</div>
              <div className="text-2xl font-bold">{strategy.total_trades}</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Strategy Notes</h3>
            <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
              {strategy.notes || "No additional notes provided for this strategy."}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default BacktestModal;
