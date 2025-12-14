
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type EconomicEvent = Database['public']['Tables']['economic_events']['Row'];

const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({ name: '', description: '' });
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('economic_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Event name is required.",
        variant: "destructive"
      });
      return;
    }

    try {
      setAdding(true);
      const { error } = await supabase
        .from('economic_events')
        .insert({
          name: newEvent.name.trim(),
          description: newEvent.description.trim() || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Economic event added successfully."
      });

      setNewEvent({ name: '', description: '' });
      fetchEvents();
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title: "Error",
        description: "Failed to add event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAdding(false);
    }
  };

  const handleToggleActive = async (eventId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('economic_events')
        .update({ is_active: isActive })
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Event ${isActive ? 'activated' : 'deactivated'} successfully.`
      });

      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('economic_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event deleted successfully."
      });

      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-primary">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8">
      <div className="text-center space-y-2 mb-8 animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Settings className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-light tracking-tight">Manage Economic Events</h1>
        <p className="text-muted-foreground font-light max-w-lg mx-auto">
          Add, edit, and manage economic events for user predictions.
        </p>
      </div>

      {/* Add new event */}
      <div className="bg-background rounded-3xl border border-border/10 p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-light tracking-tight flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add New Event
          </h2>
          <p className="text-sm text-muted-foreground font-light mt-1">
            Create a new economic event that users can make predictions on.
          </p>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="event-name" className="text-sm font-medium ml-1">Event Name *</Label>
              <Input
                id="event-name"
                placeholder="e.g., NFP (Non-Farm Payrolls)"
                value={newEvent.name}
                onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
                className="rounded-xl border-border/20 bg-muted/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-description" className="text-sm font-medium ml-1">Description</Label>
              <Input
                id="event-description"
                placeholder="Brief description of the event"
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                className="rounded-xl border-border/20 bg-muted/20"
              />
            </div>
          </div>
          <Button 
            onClick={handleAddEvent}
            disabled={adding || !newEvent.name.trim()}
            className="w-full md:w-auto rounded-full px-6"
          >
            <Plus className="h-4 w-4 mr-2" />
            {adding ? 'Adding...' : 'Add Event'}
          </Button>
        </div>
      </div>

      {/* Events list */}
      <div className="space-y-4">
        <h2 className="text-xl font-light tracking-tight ml-2">Existing Events</h2>
        {events.length === 0 ? (
          <div className="bg-background rounded-3xl border border-border/10 p-12 text-center shadow-sm">
            <Settings className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-light">No events created yet.</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="bg-background rounded-3xl border border-border/10 p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-lg tracking-tight">{event.name}</h3>
                    <Badge variant={event.is_active ? 'default' : 'secondary'} className="rounded-full font-normal">
                      {event.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground font-light">{event.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground/70 font-light pt-1">
                    Created: {new Date(event.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-border/10">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`active-${event.id}`} className="text-sm font-light">
                      Active
                    </Label>
                    <Switch
                      id={`active-${event.id}`}
                      checked={event.is_active}
                      onCheckedChange={(checked) => handleToggleActive(event.id, checked)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full h-9 w-9 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminEvents;
