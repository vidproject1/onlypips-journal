
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Pencil, FileText, FileIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChecklistItem {
  id: string;
  content: string;
  is_checked: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

interface StrategyChecklistProps {
  strategyId: string;
}

const StrategyChecklist: React.FC<StrategyChecklistProps> = ({ strategyId }) => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (!strategyId) return;
    setLoading(true);
    supabase
      .from("strategy_checklist_items")
      .select("*")
      .eq("strategy_id", strategyId)
      .order("position", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          toast({ title: "Error", description: "Could not fetch checklist.", variant: "destructive" });
        }
        setItems(data || []);
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [strategyId]);

  // Add checklist item
  const handleAdd = async () => {
    if (!newItem.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("strategy_checklist_items")
      .insert({
        strategy_id: strategyId,
        content: newItem,
        position: items.length,
      })
      .select()
      .single();
    if (error) {
      toast({ title: "Error", description: "Failed to add item.", variant: "destructive" });
    } else if (data) {
      setItems((prev) => [...prev, data]);
      setNewItem("");
    }
    setLoading(false);
  };

  // Toggle check
  const handleToggle = async (item: ChecklistItem) => {
    const { data, error } = await supabase
      .from("strategy_checklist_items")
      .update({ is_checked: !item.is_checked })
      .eq("id", item.id)
      .select()
      .single();
    if (!error && data) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_checked: data.is_checked } : i))
      );
    }
  };

  // Edit item content
  const handleRename = async (item: ChecklistItem, newContent: string) => {
    if (!newContent.trim()) return;
    const { error } = await supabase
      .from("strategy_checklist_items")
      .update({ content: newContent })
      .eq("id", item.id);
    if (!error) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, content: newContent } : i))
      );
    }
  };

  // Delete item
  const handleDelete = async (itemId: string) => {
    if (!window.confirm("Delete this checklist item?")) return;
    const { error } = await supabase
      .from("strategy_checklist_items")
      .delete()
      .eq("id", itemId);
    if (!error) {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    }
  };

  // Inline edit
  const [editing, setEditing] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  return (
    <div className="bg-background rounded-3xl border border-border/10 p-8 shadow-sm h-full animate-fade-in">
      <div className="flex items-center justify-between mb-8 border-b border-border/40 pb-6">
        <div>
          <h3 className="text-xl font-light tracking-tight flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> 
            Strategy Checklist
          </h3>
          <p className="text-sm text-muted-foreground mt-1 ml-7">
            Define your execution rules and confirmation criteria
          </p>
        </div>
        <div className="text-xs text-muted-foreground font-light bg-muted/20 px-3 py-1 rounded-full border border-border/10">
          {items.length} Items
        </div>
      </div>

      <div className="space-y-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
          className="relative"
        >
          <Input
            placeholder="Add new checklist item..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            disabled={loading}
            className="border-border/20 focus-visible:ring-0 bg-muted/30 h-12 rounded-xl pr-12 text-base"
          />
          <Button 
            type="submit" 
            disabled={!newItem.trim() || loading}
            size="icon"
            className="absolute right-1 top-1 h-10 w-10 rounded-lg shadow-sm"
          >
            <FileIcon className="h-5 w-5" />
          </Button>
        </form>

        <ul className="space-y-3">
          {items.length === 0 && (
            <div className="text-center py-12 flex flex-col items-center justify-center text-muted-foreground">
              <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                <ListChecks className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p>No checklist items yet.</p>
              <p className="text-xs mt-1 text-muted-foreground/70">Add your first rule above.</p>
            </div>
          )}
          
          {items.map((item) => (
            <li 
              key={item.id} 
              className={`
                group flex items-center justify-between gap-3 p-3 rounded-xl border transition-all duration-200
                ${item.is_checked 
                  ? "bg-muted/10 border-border/10" 
                  : "bg-background border-border/20 hover:border-border/40 hover:shadow-sm"
                }
              `}
            >
              <div
                className={`flex items-center gap-3 flex-1 cursor-pointer transition-opacity ${
                  item.is_checked ? "opacity-60" : "opacity-100"
                }`}
                onClick={() => handleToggle(item)}
              >
                <div className={`
                  h-6 w-6 rounded-full border flex items-center justify-center transition-colors
                  ${item.is_checked 
                    ? "bg-primary border-primary text-primary-foreground" 
                    : "border-muted-foreground/30 group-hover:border-primary/50"
                  }
                `}>
                  {item.is_checked && <Check className="h-3.5 w-3.5" />}
                </div>
                
                {editing === item.id ? (
                  <Input
                    className="h-9 bg-background border-border/20 rounded-lg text-sm flex-1"
                    autoFocus
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={() => {
                      setEditing(null);
                      setEditingContent("");
                    }}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter" && editingContent.trim()) {
                        await handleRename(item, editingContent);
                        setEditing(null);
                      }
                    }}
                  />
                ) : (
                  <span className={`text-sm font-medium ${item.is_checked ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {item.content}
                  </span>
                )}
              </div>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-lg hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing(item.id);
                    setEditingContent(item.content);
                  }}
                >
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                >
                  <span className="sr-only">Delete</span>
                  <span className="text-lg leading-none mb-1">×</span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StrategyChecklist;
