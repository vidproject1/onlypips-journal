import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import type { Database } from '@/integrations/supabase/types'

type Trade = Database['public']['Tables']['trades']['Row']

interface AverageGainLossLineChartProps {
  trades: Trade[]
}

export default function AverageGainLossLineChart({ trades }: AverageGainLossLineChartProps) {
  // Group trades by date
  const byDate: Record<string, Trade[]> = {}
  trades.forEach(t => {
    const date = new Date(t.created_at).toLocaleDateString()
    if (!byDate[date]) byDate[date] = []
    byDate[date].push(t)
  })
  const data = Object.entries(byDate).map(([date, trades]) => {
    const gains = trades.filter(t => Number(t.profit_loss) > 0)
    const losses = trades.filter(t => Number(t.profit_loss) < 0)
    return {
      date,
      avgGain: gains.length ? gains.reduce((a, t) => a + Number(t.profit_loss), 0) / gains.length : 0,
      avgLoss: losses.length ? losses.reduce((a, t) => a + Number(t.profit_loss), 0) / losses.length : 0,
    }
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="text-base">Average Gain/Loss per Trade</CardTitle>
      </CardHeader>
      <CardContent className="h-64 p-0 sm:p-4">
        <ChartContainer config={{ avgGain: { color: '#10b981' }, avgLoss: { color: '#ef4444' } }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} minTickGap={20} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avgGain" stroke="#10b981" strokeWidth={2} dot={false} name="Avg Gain" />
              <Line type="monotone" dataKey="avgLoss" stroke="#ef4444" strokeWidth={2} dot={false} name="Avg Loss" />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
} 