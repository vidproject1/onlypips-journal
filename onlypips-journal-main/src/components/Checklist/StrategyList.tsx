
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListChecks, Pencil, FolderPlus, Folder } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ChecklistInfo from "./ChecklistInfo";

interface Strategy {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface StrategyListProps {
  userId: string;
  selectedId?: string;
  onStrategySelect: (id: string) => void;
}

const StrategyList: React.FC<StrategyListProps> = ({
  userId,
  selectedId,
  onStrategySelect,
}) => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch all strategies for the user
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("strategies")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        toast({ title: "Error", description: "Could not fetch strategies.", variant: "destructive" });
      } else {
        setStrategies(data || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [userId, toast]);

  // Create new strategy
  const handleAdd = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("strategies")
      .insert({ 
        user_id: userId, 
        name: newName, 
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to create strategy.", variant: "destructive" });
    } else if (data) {
      setStrategies((prev) => [data, ...prev]);
      setNewName("");
      onStrategySelect(data.id);
    }
    setLoading(false);
  };

  // Allow renaming a strategy
  const handleRename = async (id: string, name: string) => {
    if (!name.trim()) return;
    setLoading(true);
    const { error } = await supabase
      .from("strategies")
      .update({ name })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Rename failed.", variant: "destructive" });
    } else {
      setStrategies((list) =>
        list.map((s) => (s.id === id ? { ...s, name } : s))
      );
    }
    setLoading(false);
  };

  // Allow deleting a strategy
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this strategy and all its checklist items?")) return;
    setLoading(true);
    const { error } = await supabase
      .from("strategies")
      .delete()
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    } else {
      setStrategies((list) => list.filter((x) => x.id !== id));
      if (selectedId === id) onStrategySelect("");
    }
    setLoading(false);
  };

  // Inline rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");

  return (
    <div className="bg-background rounded-3xl border border-border/10 p-6 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium tracking-tight flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-primary" />
          My Strategies
        </h2>
        <ChecklistInfo />
      </div>

      <div className="space-y-4 mb-6">
        <div className="relative">
          <Input
            placeholder="New strategy name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={loading}
            className="border-border/20 focus-visible:ring-0 bg-muted/30 h-10 rounded-xl pr-10"
          />
          <Button 
            size="icon" 
            className="absolute right-1 top-1 h-8 w-8 rounded-lg shadow-none" 
            onClick={handleAdd}
            disabled={!newName.trim() || loading}
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {strategies.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border/20 rounded-xl bg-muted/5">
            <Folder className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
            No strategies yet.
            <br /> Create one above!
          </div>
        )}
        
        {strategies.map((strategy) => (
          <div
            key={strategy.id}
            className={`
              group flex items-center justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer border
              ${selectedId === strategy.id 
                ? "bg-primary/5 border-primary/20 shadow-sm" 
                : "bg-transparent border-transparent hover:bg-muted/30 hover:border-border/10"
              }
            `}
            onClick={() => onStrategySelect(strategy.id)}
          >
            <div className="flex items-center gap-3 flex-1 overflow-hidden">
              <div className={`
                w-2 h-2 rounded-full flex-shrink-0 transition-colors
                ${selectedId === strategy.id ? "bg-primary" : "bg-muted-foreground/30 group-hover:bg-primary/50"}
              `} />
              
              {editingId === strategy.id ? (
                <Input
                  className="h-8 bg-background border-border/20 rounded-lg text-sm"
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && editingName.trim()) {
                      await handleRename(strategy.id, editingName);
                      setEditingId(null);
                    }
                  }}
                />
              ) : (
                <span className={`text-sm truncate font-medium ${selectedId === strategy.id ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                  {strategy.name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-lg hover:bg-background hover:shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(strategy.id);
                  setEditingName(strategy.name);
                }}
              >
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-lg hover:bg-destructive/10 hover:text-destructive hover:shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(strategy.id);
                }}
              >
                <span className="sr-only">Delete</span>
                <span className="text-lg leading-none mb-1">×</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StrategyList;
