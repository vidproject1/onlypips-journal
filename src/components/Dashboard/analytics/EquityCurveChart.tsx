import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import type { Database } from '@/integrations/supabase/types'

type Trade = Database['public']['Tables']['trades']['Row']

interface EquityCurveChartProps {
  trades: Trade[]
}

export default function EquityCurveChart({ trades }: EquityCurveChartProps) {
  // Sort trades by created_at ascending
  const sorted = [...trades].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  let cumulative = 0
  const data = sorted.map((trade, i) => {
    cumulative += Number(trade.profit_loss)
    return {
      date: new Date(trade.created_at).toLocaleDateString(),
      equity: Number(cumulative.toFixed(2)),
    }
  })

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="text-base">Equity Curve</CardTitle>
      </CardHeader>
      <CardContent className="h-64 p-0 sm:p-4">
        <ChartContainer config={{ equity: { color: '#10b981' } }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} minTickGap={20} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="equity" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
} 