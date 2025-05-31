import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { Database } from '@/integrations/supabase/types'

type Trade = Database['public']['Tables']['trades']['Row']

interface ProfitFactorStatsProps {
  trades: Trade[]
}

export default function ProfitFactorStats({ trades }: ProfitFactorStatsProps) {
  const wins = trades.filter(t => Number(t.profit_loss) > 0)
  const losses = trades.filter(t => Number(t.profit_loss) < 0)
  const sumWins = wins.reduce((acc, t) => acc + Number(t.profit_loss), 0)
  const sumLosses = losses.reduce((acc, t) => acc + Number(t.profit_loss), 0)
  const profitFactor = sumLosses !== 0 ? (sumWins / Math.abs(sumLosses)) : null
  const avgWin = wins.length ? sumWins / wins.length : 0
  const avgLoss = losses.length ? sumLosses / losses.length : 0
  const avgRR = avgLoss !== 0 ? (avgWin / Math.abs(avgLoss)) : null

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 w-full">
      <Card className="flex-1 flex flex-col items-center justify-center">
        <CardHeader className="flex flex-row items-center gap-2 pb-2 justify-center">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <CardTitle className="text-base">Profit Factor</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          <span
            className={`text-4xl font-extrabold text-center ${
              profitFactor !== null && profitFactor >= 1
                ? 'text-green-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                : 'text-red-500'
            }`}
          >
            {profitFactor !== null ? profitFactor.toFixed(2) : '--'}
          </span>
        </CardContent>
      </Card>
      <Card className="flex-1 flex flex-col items-center justify-center">
        <CardHeader className="flex flex-row items-center gap-2 pb-2 justify-center">
          <TrendingDown className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-base">Avg Risk-Reward</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          <span
            className={`text-4xl font-extrabold text-center tracking-wide ${
              avgRR !== null && avgRR >= 1
                ? 'text-green-500 font-mono'
                : 'text-red-500 font-mono'
            }`}
            style={{ letterSpacing: '0.05em' }}
          >
            {avgRR !== null ? avgRR.toFixed(2) : '--'}
          </span>
        </CardContent>
      </Card>
    </div>
  )
} 