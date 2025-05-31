import React, { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RestorePurchasedStrategiesProps {
  userId: string
  onRestore: () => void
}

interface PurchasedStrategy {
  id: string
  title: string
  description: string
  marketplace_checklist_id: string
  full_items: any[]
}

export default function RestorePurchasedStrategies({ userId, onRestore }: RestorePurchasedStrategiesProps) {
  const [purchased, setPurchased] = useState<PurchasedStrategy[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPurchased()
  }, [userId])

  async function fetchPurchased() {
    setLoading(true)
    // 1. Get all approved/completed purchases
    const { data: purchases, error: purchasesError } = await supabase
      .from("user_purchases")
      .select("marketplace_checklist_id")
      .eq("user_id", userId)
      .in("approval_status", ["approved", "completed"])
    if (purchasesError) {
      setLoading(false)
      return
    }
    const purchasedIds = purchases.map((p: any) => p.marketplace_checklist_id)
    if (!purchasedIds.length) {
      setPurchased([])
      setLoading(false)
      return
    }
    // 2. Get all user's current strategies
    const { data: strategies, error: strategiesError } = await supabase
      .from("strategies")
      .select("name")
      .eq("user_id", userId)
    if (strategiesError) {
      setLoading(false)
      return
    }
    const strategyNames = strategies.map((s: any) => s.name)
    // 3. Get all purchased checklists
    const { data: checklists, error: checklistsError } = await supabase
      .from("marketplace_checklists")
      .select("id, title, description, full_items")
      .in("id", purchasedIds)
    if (checklistsError) {
      setLoading(false)
      return
    }
    // 4. Filter out those already in strategies
    const notAdded = checklists.filter((c: any) => !strategyNames.includes(c.title))
      .map((c: any) => ({ ...c, marketplace_checklist_id: c.id }))
    setPurchased(notAdded)
    setLoading(false)
  }

  async function handleRestore(checklist: PurchasedStrategy) {
    // Add strategy and its items
    const { data: strategy, error: strategyError } = await supabase
      .from("strategies")
      .insert({ name: checklist.title, user_id: userId })
      .select()
      .single()
    if (strategyError) {
      toast({ title: "Error", description: "Could not restore strategy.", variant: "destructive" })
      return
    }
    const items = (Array.isArray(checklist.full_items) ? checklist.full_items : typeof checklist.full_items === 'string' ? JSON.parse(checklist.full_items) : []).map((item: any, index: number) => ({
      strategy_id: strategy.id,
      content: item.content,
      position: index,
      is_checked: false
    }))
    if (items.length) {
      const { error: itemsError } = await supabase
        .from("strategy_checklist_items")
        .insert(items)
      if (itemsError) {
        toast({ title: "Error", description: "Could not add checklist items.", variant: "destructive" })
        return
      }
    }
    toast({ title: "Restored!", description: `${checklist.title} has been re-added to your strategies.` })
    onRestore()
    fetchPurchased()
  }

  if (loading) return <div className="my-6 text-center text-muted-foreground">Loading purchased strategies…</div>
  if (!purchased.length) return null

  return (
    <div className="my-8">
      <h2 className="text-lg font-semibold mb-3">Restore Purchased Strategies</h2>
      <div className="space-y-3">
        {purchased.map((c) => (
          <Card key={c.id} className="flex flex-row items-center justify-between">
            <div className="flex-1">
              <CardHeader className="pb-1">
                <CardTitle className="text-base">{c.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-2 text-sm text-muted-foreground">
                {c.description}
              </CardContent>
            </div>
            <Button onClick={() => handleRestore(c)} className="gap-1 mr-4">
              <ExternalLink className="h-4 w-4" /> Restore
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
} 