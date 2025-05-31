import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { Database } from '@/integrations/supabase/types'

type Trade = Database['public']['Tables']['trades']['Row']

interface WinLossPieChartProps {
  trades: Trade[]
}

const COLORS = ['#10b981', '#ef4444', '#94a3b8']
const LABELS = ['WIN', 'LOSS', 'BREAK EVEN']

export default function WinLossPieChart({ trades }: WinLossPieChartProps) {
  const win = trades.filter(t => (t.result || '').trim().toUpperCase() === 'WIN').length
  const loss = trades.filter(t => (t.result || '').trim().toUpperCase() === 'LOSS').length
  const be = trades.filter(t => (t.result || '').trim().toUpperCase() === 'BREAK EVEN' || t.is_break_even).length
  const data = [
    { name: 'Win', value: win },
    { name: 'Loss', value: loss },
    { name: 'Break Even', value: be },
  ]

  const hasData = data.some(d => d.value > 0)

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="text-base">Win/Loss/Break-even</CardTitle>
      </CardHeader>
      <CardContent className="h-64 p-0 sm:p-4 flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                innerRadius={32}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                paddingAngle={2}
              >
                {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} iconType="circle"/>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full text-center text-muted-foreground text-sm">No trade results to display.</div>
        )}
      </CardContent>
    </Card>
  )
} 