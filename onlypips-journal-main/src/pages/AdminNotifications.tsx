
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bell, AlertTriangle, CheckCircle2 } from "lucide-react";

const AdminNotifications: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!title) throw new Error("Title is required");
      const { data, error } = await supabase
        .from("notifications")
        .insert([{ title, description }])
        .select()
        .single();
      if (error) throw error;
    },
    onSuccess: () => {
      setSuccess("Notification sent successfully!");
      setTitle("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["notifications"]});
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (e: any) => {
      setError(e?.message || "Failed to send notification");
      setTimeout(() => setError(null), 3000);
    },
  });

  return (
    <div className="max-w-xl mx-auto py-12 px-6 animate-fade-in">
      <div className="mb-8 text-center space-y-2">
        <div className="flex items-center justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-light tracking-tight">Push Notification</h2>
        <p className="text-muted-foreground font-light text-sm max-w-sm mx-auto">
          Send announcements and updates to all registered users.
        </p>
      </div>

      <div className="bg-background rounded-3xl border border-border/10 p-8 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            setSuccess(null);
            mutate();
          }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium ml-1">Title</Label>
            <Input
              id="title"
              placeholder="Notification Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="rounded-xl border-border/20 bg-muted/20 h-11"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium ml-1">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter the notification message..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="rounded-xl border-border/20 bg-muted/20 resize-none"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full rounded-full h-11 font-medium shadow-sm hover:shadow-md transition-all"
          >
            {isPending ? "Sending..." : "Send Notification"}
          </Button>

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 text-emerald-600 text-sm animate-fade-in">
              <CheckCircle2 className="h-4 w-4" />
              {success}
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm animate-fade-in">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}
        </form>
      </div>

      <div className="mt-8 p-4 rounded-2xl bg-muted/30 border border-border/5 text-xs text-muted-foreground text-center">
        <p>
          <strong>Note:</strong> For demo purposes, any logged-in user can access this page as "admin".
          Implement stricter logic as needed!
        </p>
      </div>
    </div>
  );
};

export default AdminNotifications;
