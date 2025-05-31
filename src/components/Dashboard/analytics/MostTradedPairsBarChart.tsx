import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import type { Database } from '@/integrations/supabase/types'

type Trade = Database['public']['Tables']['trades']['Row']

interface MostTradedPairsBarChartProps {
  trades: Trade[]
}

export default function MostTradedPairsBarChart({ trades }: MostTradedPairsBarChartProps) {
  const freq: Record<string, number> = {}
  trades.forEach(t => {
    freq[t.pair] = (freq[t.pair] || 0) + 1
  })
  const data = Object.entries(freq)
    .map(([pair, count]) => ({ pair, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="text-base">Most Traded Pairs</CardTitle>
      </CardHeader>
      <CardContent className="h-64 p-0 sm:p-4">
        <ChartContainer config={{ count: { color: '#6366f1' } }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" fontSize={12} allowDecimals={false} />
              <YAxis dataKey="pair" type="category" fontSize={12} width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
} 