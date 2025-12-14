import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PerformanceReport } from '@/lib/performanceReport';

interface PerformanceReportCardProps {
  report: PerformanceReport;
  strategyNames: Record<string, string>;
}

const labelColors: Record<string, string> = {
  Excellent: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20',
  Improving: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  Consistent: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20',
  Volatile: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20',
  Declining: 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20',
};

export const PerformanceReportCard: React.FC<PerformanceReportCardProps> = ({ report, strategyNames }) => {
  return (
    <div className="max-w-2xl mx-auto bg-background text-foreground p-6 rounded-3xl border border-border/10 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between border-b border-border/40 pb-6">
        <h2 className="text-xl font-medium tracking-tight">Performance Insight Report</h2>
        <Badge className={`${labelColors[report.label] || 'bg-muted text-muted-foreground'} border-none px-3 py-1 text-xs font-medium uppercase tracking-wider rounded-full`}>
          {report.label}
        </Badge>
      </div>
      
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Win Rate per Strategy</h3>
            <ul className="space-y-2">
              {Object.entries(report.winRatePerStrategy).map(([id, rate]) => (
                <li key={id} className="flex justify-between items-center text-sm">
                  <span className="text-foreground">{strategyNames[id] || 'Unknown'}</span>
                  <span className="font-light">{rate.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg R:R per Strategy</h3>
            <ul className="space-y-2">
              {Object.entries(report.avgRRPerStrategy).map(([id, rr]) => (
                <li key={id} className="flex justify-between items-center text-sm">
                  <span className="text-foreground">{strategyNames[id] || 'Unknown'}</span>
                  <span className="font-light">{rr.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Checklist vs Outcome</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between items-center">
                <span className="text-foreground">With Checklist</span>
                <span className="font-light">{report.checklistCompletionVsOutcome.withChecklist.winRate.toFixed(1)}% <span className="text-muted-foreground text-xs">({report.checklistCompletionVsOutcome.withChecklist.count})</span></span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-foreground">Without Checklist</span>
                <span className="font-light">{report.checklistCompletionVsOutcome.withoutChecklist.winRate.toFixed(1)}% <span className="text-muted-foreground text-xs">({report.checklistCompletionVsOutcome.withoutChecklist.count})</span></span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Execution Consistency</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between items-center">
                <span className="text-foreground">Common Time</span>
                <span className="font-light">{report.executionConsistency.mostCommonTime || 'N/A'}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-foreground">Common Pair</span>
                <span className="font-light">{report.executionConsistency.mostCommonPair || 'N/A'}</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Monthly Volume</h3>
            <ul className="space-y-2">
              {Object.entries(report.tradeFrequency.monthly).map(([month, count]) => (
                <li key={month} className="flex justify-between items-center text-sm">
                  <span className="text-foreground">{month}</span>
                  <span className="font-light">{count}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Holding Duration</h3>
            <div className="text-xl font-light">{report.avgHoldingDuration.toFixed(2)} <span className="text-sm text-muted-foreground">hours</span></div>
          </div>
        </div>
        
        <div className="space-y-3 pt-6 border-t border-border/40">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Insights</h3>
          <ul className="space-y-2">
            {report.insights.length > 0 ? report.insights.map((insight, i) => (
              <li key={i} className="text-sm font-light text-foreground flex gap-2">
                <span className="text-primary">•</span>
                {insight}
              </li>
            )) : <li className="text-sm text-muted-foreground italic">No insights available.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PerformanceReportCard; 