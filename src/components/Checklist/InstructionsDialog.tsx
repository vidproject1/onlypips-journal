import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { PlayCircle } from "lucide-react"
import { AspectRatio } from "@/components/ui/aspect-ratio"

interface InstructionsDialogProps {
  marketplaceChecklistId: string
}

interface InstructionData {
  instruction_video_path: string
  html_content: string
}

export default function InstructionsDialog({ marketplaceChecklistId }: InstructionsDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<InstructionData | null>(null)

  async function fetchInstructions() {
    setLoading(true)
    setError(null)
    setData(null)
    const { data, error } = await supabase
      .from("strategy_instructions")
      .select("instruction_video_path, html_content")
      .eq("marketplace_checklist_id", marketplaceChecklistId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
    if (error) setError("No instructions found for this strategy.")
    else setData(data)
    setLoading(false)
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (isOpen) fetchInstructions()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <PlayCircle className="h-4 w-4" /> Instructions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg w-full p-0 sm:p-6">
        <DialogHeader>
          <DialogTitle>Strategy Instructions</DialogTitle>
        </DialogHeader>
        {loading && <div className="py-8 text-center text-muted-foreground">Loading…</div>}
        {error && <div className="py-8 text-center text-destructive">{error}</div>}
        {data && (
          <div className="flex flex-col gap-4 max-h-[80vh] sm:max-h-[80vh] overflow-y-auto p-2 sm:p-4">
            {data.instruction_video_path && (
              <AspectRatio ratio={16 / 9} className="w-full max-w-full rounded-lg overflow-hidden bg-black">
                <video
                  className="w-full h-full object-contain"
                  controls
                  src={data.instruction_video_path}
                />
              </AspectRatio>
            )}
            {data.html_content && (
              <div
                className="prose prose-sm max-w-none text-foreground dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: data.html_content }}
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 