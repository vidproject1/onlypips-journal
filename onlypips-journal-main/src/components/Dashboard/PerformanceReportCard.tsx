import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PerformanceReport } from '@/lib/performanceReport';

interface PerformanceReportCardProps {
  report: PerformanceReport;
  strategyNames: Record<string, string>;
}

const labelColors: Record<string, string> = {
  Excellent: 'bg-green-500/10 text-green-700',
  Improving: 'bg-blue-500/10 text-blue-700',
  Consistent: 'bg-yellow-500/10 text-yellow-700',
  Volatile: 'bg-orange-500/10 text-orange-700',
  Declining: 'bg-red-500/10 text-red-700',
};

export const PerformanceReportCard: React.FC<PerformanceReportCardProps> = ({ report, strategyNames }) => {
  return (
    <Card className="max-w-2xl mx-auto glass-card animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Performance Insight Report</CardTitle>
          <Badge className={labelColors[report.label] || 'bg-gray-200 text-gray-700'}>{report.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Win Rate per Strategy</h3>
            <ul className="space-y-1">
              {Object.entries(report.winRatePerStrategy).map(([id, rate]) => (
                <li key={id} className="flex justify-between">
                  <span>{strategyNames[id] || 'Unknown'}</span>
                  <span className="font-mono">{rate.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Avg R:R per Strategy</h3>
            <ul className="space-y-1">
              {Object.entries(report.avgRRPerStrategy).map(([id, rr]) => (
                <li key={id} className="flex justify-between">
                  <span>{strategyNames[id] || 'Unknown'}</span>
                  <span className="font-mono">{rr.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Checklist Completion vs Outcome</h3>
            <ul className="space-y-1">
              <li>With Checklist: <span className="font-mono">{report.checklistCompletionVsOutcome.withChecklist.winRate.toFixed(1)}%</span> ({report.checklistCompletionVsOutcome.withChecklist.count} trades)</li>
              <li>Without Checklist: <span className="font-mono">{report.checklistCompletionVsOutcome.withoutChecklist.winRate.toFixed(1)}%</span> ({report.checklistCompletionVsOutcome.withoutChecklist.count} trades)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Consistency in Execution</h3>
            <ul className="space-y-1">
              <li>Most Common Time: <span className="font-mono">{report.executionConsistency.mostCommonTime || 'N/A'}</span></li>
              <li>Most Common Pair: <span className="font-mono">{report.executionConsistency.mostCommonPair || 'N/A'}</span></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Trade Frequency (Monthly)</h3>
            <ul className="space-y-1">
              {Object.entries(report.tradeFrequency.monthly).map(([month, count]) => (
                <li key={month} className="flex justify-between">
                  <span>{month}</span>
                  <span className="font-mono">{count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Avg Holding Duration</h3>
            <div className="font-mono">{report.avgHoldingDuration.toFixed(2)} hours</div>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Personalized Insights</h3>
          <ul className="list-disc pl-6 space-y-1">
            {report.insights.length > 0 ? report.insights.map((insight, i) => (
              <li key={i}>{insight}</li>
            )) : <li>No insights available.</li>}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceReportCard; 