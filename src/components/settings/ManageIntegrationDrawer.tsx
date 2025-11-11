import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  CheckCircle2,
  AlertCircle,
  Trash2,
  Plus,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface Integration {
  id: string;
  integration_type: string;
  integration_status: string;
  is_connected: boolean;
  connected_at: string | null;
  last_synced_at: string | null;
  integration_scopes?: string[];
}

interface IntegrationRule {
  id: string;
  match_type: string;
  match_value: string;
  habit_id: string;
  active: boolean;
  created_at: string;
  habits?: {
    id: string;
    name: string;
  };
}

interface IntegrationEvent {
  id: string;
  provider: string;
  title: string;
  completed_at: string;
  event_type: string;
  processed: boolean;
  created_at: string;
}

interface ManageIntegrationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerId: string;
  providerName: string;
  integration: Integration | undefined;
  onReauthorize: () => void;
}

const TODOIST_MATCH_TYPES = [
  { value: 'title_exact', label: 'Title (exact match)' },
  { value: 'title_contains', label: 'Title (contains)' },
  { value: 'tag', label: 'Tag/Label' },
];

const STRAVA_MATCH_TYPES = [
  { value: 'type', label: 'Activity Type' },
  { value: 'title_contains', label: 'Title (contains)' },
];

const STRAVA_SPORT_TYPES = [
  'Run', 'Ride', 'Swim', 'Walk', 'Hike', 'Workout',
  'WeightTraining', 'Yoga', 'AlpineSki', 'BackcountrySki',
];

export function ManageIntegrationDrawer({
  open,
  onOpenChange,
  providerId,
  providerName,
  integration,
  onReauthorize,
}: ManageIntegrationDrawerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [rules, setRules] = useState<IntegrationRule[]>([]);
  const [events, setEvents] = useState<IntegrationEvent[]>([]);
  const [habits, setHabits] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // New rule form state
  const [newRule, setNewRule] = useState({
    match_type: providerId === 'todoist' ? 'title_contains' : 'type',
    match_value: '',
    habit_id: '',
    active: true,
  });

  useEffect(() => {
    if (open && integration) {
      fetchRules();
      fetchEvents();
      fetchHabits();
    }
  }, [open, integration]);

  const fetchRules = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('integration_rules')
        .select('*, habits(id, name)')
        .eq('user_id', user.id)
        .eq('provider', providerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error fetching rules:', error);
    }
  };

  const fetchEvents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('integration_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', providerId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchHabits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setHabits(data || []);
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  };

  const handleAddRule = async () => {
    if (!user || !newRule.habit_id || !newRule.match_value) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from('integration_rules').insert({
        user_id: user.id,
        provider: providerId,
        match_type: newRule.match_type,
        match_value: newRule.match_value,
        habit_id: newRule.habit_id,
        active: newRule.active,
      });

      if (error) throw error;

      toast({
        title: 'Rule added',
        description: 'Integration rule created successfully',
      });

      setNewRule({
        match_type: providerId === 'todoist' ? 'title_contains' : 'type',
        match_value: '',
        habit_id: '',
        active: true,
      });
      fetchRules();
    } catch (error) {
      console.error('Error adding rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to add rule',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('integration_rules')
        .delete()
        .eq('id', ruleId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Rule deleted',
        description: 'Integration rule removed successfully',
      });
      fetchRules();
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete rule',
        variant: 'destructive',
      });
    }
  };

  const handleToggleRule = async (ruleId: string, active: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('integration_rules')
        .update({ active })
        .eq('id', ruleId)
        .eq('user_id', user.id);

      if (error) throw error;
      fetchRules();
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  };

  const handleDisconnect = async () => {
    if (!user) return;

    setDisconnecting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('integrations-revoke', {
        body: { provider: providerId },
      });

      if (response.error) throw response.error;

      toast({
        title: 'Disconnected',
        description: `${providerName} has been disconnected`,
      });

      onOpenChange(false);
      window.location.reload();
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect integration',
        variant: 'destructive',
      });
    } finally {
      setDisconnecting(false);
    }
  };

  const matchTypes = providerId === 'todoist' ? TODOIST_MATCH_TYPES : STRAVA_MATCH_TYPES;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Manage {providerName}</SheetTitle>
          <SheetDescription>
            Configure rules and view sync activity
          </SheetDescription>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Connection Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    variant={
                      integration?.integration_status === 'connected'
                        ? 'default'
                        : 'destructive'
                    }
                  >
                    {integration?.integration_status === 'connected' ? (
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                    ) : (
                      <AlertCircle className="mr-1 h-3 w-3" />
                    )}
                    {integration?.integration_status || 'Unknown'}
                  </Badge>
                </div>

                {integration?.integration_scopes && integration.integration_scopes.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Scopes</span>
                    <div className="flex gap-1">
                      {integration.integration_scopes.map((scope) => (
                        <Badge key={scope} variant="outline" className="text-xs">
                          {scope}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {integration?.connected_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Connected</span>
                    <span className="text-sm">
                      {new Date(integration.connected_at).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {integration?.last_synced_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Synced</span>
                    <span className="text-sm">
                      {new Date(integration.last_synced_at).toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="pt-4 space-y-2">
                  <Button
                    onClick={onReauthorize}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reauthorize
                  </Button>

                  <Button
                    onClick={handleDisconnect}
                    variant="destructive"
                    className="w-full"
                    disabled={disconnecting}
                  >
                    {disconnecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Disconnecting...
                      </>
                    ) : (
                      'Disconnect'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Privacy Note</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ExternalLink className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <span>
                    Only new activity after you connect is tracked. No historical data is imported.
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add New Rule</CardTitle>
                <CardDescription>
                  Map {providerName} items to your habits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Match Type</Label>
                    <Select
                      value={newRule.match_type}
                      onValueChange={(value) =>
                        setNewRule({ ...newRule, match_type: value, match_value: '' })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {matchTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Match Value</Label>
                    {providerId === 'strava' && newRule.match_type === 'type' ? (
                      <Select
                        value={newRule.match_value}
                        onValueChange={(value) =>
                          setNewRule({ ...newRule, match_value: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sport type" />
                        </SelectTrigger>
                        <SelectContent>
                          {STRAVA_SPORT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder={
                          newRule.match_type === 'tag'
                            ? 'e.g., work, exercise'
                            : 'e.g., Read 10 pages'
                        }
                        value={newRule.match_value}
                        onChange={(e) =>
                          setNewRule({ ...newRule, match_value: e.target.value })
                        }
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Habit</Label>
                    <Select
                      value={newRule.habit_id}
                      onValueChange={(value) =>
                        setNewRule({ ...newRule, habit_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a habit" />
                      </SelectTrigger>
                      <SelectContent>
                        {habits.map((habit) => (
                          <SelectItem key={habit.id} value={habit.id}>
                            {habit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newRule.active}
                      onCheckedChange={(checked) =>
                        setNewRule({ ...newRule, active: checked })
                      }
                    />
                    <Label>Active</Label>
                  </div>
                </div>

                <Button onClick={handleAddRule} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Rule
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Rules</CardTitle>
              </CardHeader>
              <CardContent>
                {rules.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No rules configured yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {rules.map((rule) => (
                      <div
                        key={rule.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {matchTypes.find((t) => t.value === rule.match_type)?.label}
                            </Badge>
                            <span className="text-sm font-medium">
                              {rule.match_value}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            → {rule.habits?.name || 'Unknown habit'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rule.active}
                            onCheckedChange={(checked) =>
                              handleToggleRule(rule.id, checked)
                            }
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRule(rule.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Events</CardTitle>
                <CardDescription>Last 10 synchronized events</CardDescription>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No events yet
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium">
                            {event.title || 'Untitled'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {event.event_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {new Date(event.completed_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {event.processed ? (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Processed
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
