import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { Database } from '@/integrations/supabase/types'

type Trade = Database['public']['Tables']['trades']['Row']

interface TradeHeatmapProps {
  trades: Trade[]
}

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const hours = Array.from({ length: 24 }, (_, i) => i)

export default function TradeHeatmap({ trades }: TradeHeatmapProps) {
  // Build heatmap data: day x hour
  const heatmap: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
  trades.forEach(t => {
    const d = new Date(t.created_at)
    const day = d.getDay()
    const hour = d.getHours()
    heatmap[day][hour]++
  })
  const max = Math.max(...heatmap.flat()) || 1

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="text-base">Trading Activity Heatmap</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="flex flex-col gap-2">
          <div className="flex gap-1 text-xs text-muted-foreground">
            <div className="w-8" />
            {hours.map(h => (
              <div key={h} className="w-6 text-center">{h}</div>
            ))}
          </div>
          {days.map((day, i) => (
            <div key={day} className="flex gap-1 items-center">
              <div className="w-8 text-xs text-muted-foreground">{day}</div>
              {hours.map(h => {
                const count = heatmap[i][h]
                const intensity = count === 0 ? 'bg-gray-100 dark:bg-gray-800' :
                  count < max * 0.25 ? 'bg-blue-100 dark:bg-blue-900' :
                  count < max * 0.5 ? 'bg-blue-300 dark:bg-blue-700' :
                  count < max * 0.75 ? 'bg-blue-500 dark:bg-blue-600' :
                  'bg-blue-700 dark:bg-blue-400'
                return (
                  <div
                    key={h}
                    className={`w-6 h-6 rounded ${intensity} flex items-center justify-center text-[10px] font-medium`}
                    title={`Trades: ${count}`}
                  >
                    {count > 0 ? count : ''}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 