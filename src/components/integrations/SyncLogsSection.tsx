import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIntegrations } from '@/hooks/useIntegrations';
import { 
  Activity, 
  Calendar, 
  Music, 
  Zap, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const getIntegrationIcon = (type: string) => {
  switch (type) {
    case 'spotify': return Music;
    case 'google_fit': return Activity;
    case 'calendar': return Calendar;
    case 'zapier': return Zap;
    default: return Activity;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success': return CheckCircle;
    case 'error': return XCircle;
    case 'pending': return Clock;
    default: return AlertCircle;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success': return 'text-green-600';
    case 'error': return 'text-red-600';
    case 'pending': return 'text-yellow-600';
    default: return 'text-gray-600';
  }
};

export const SyncLogsSection: React.FC = () => {
  const { syncLogs, fetchSyncLogs, isLoading } = useIntegrations();
  const [selectedIntegration, setSelectedIntegration] = React.useState<string>('all');

  const filteredLogs = selectedIntegration === 'all' 
    ? syncLogs 
    : syncLogs.filter(log => log.integration_type === selectedIntegration);

  const handleRefresh = () => {
    fetchSyncLogs(selectedIntegration === 'all' ? undefined : selectedIntegration);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sync History</h3>
        <div className="flex items-center gap-2">
          <Select value={selectedIntegration} onValueChange={setSelectedIntegration}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by integration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Integrations</SelectItem>
              <SelectItem value="spotify">Spotify</SelectItem>
              <SelectItem value="google_fit">Google Fit</SelectItem>
              <SelectItem value="calendar">Calendar</SelectItem>
              <SelectItem value="zapier">Zapier</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <Card className="glass-card border-primary/20">
          <CardContent className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium mb-2">No Sync History</h4>
            <p className="text-muted-foreground">
              Sync history will appear here once you start syncing data with your connected integrations
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const IntegrationIcon = getIntegrationIcon(log.integration_type);
            const StatusIcon = getStatusIcon(log.status);
            const statusColor = getStatusColor(log.status);

            return (
              <Card key={log.id} className="glass-card border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IntegrationIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base capitalize">
                          {log.integration_type.replace('_', ' ')} Sync
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {new Date(log.started_at).toLocaleString()}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {log.sync_type}
                      </Badge>
                      <div className={`flex items-center gap-1 ${statusColor}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-sm capitalize">{log.status}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Records Processed:</span>
                    <span className="font-medium">{log.records_processed}</span>
                  </div>

                  {log.completed_at && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">
                        {Math.round(
                          (new Date(log.completed_at).getTime() - new Date(log.started_at).getTime()) / 1000
                        )}s
                      </span>
                    </div>
                  )}

                  {log.error_message && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                      <div className="font-medium text-red-800 mb-1">Error:</div>
                      <div className="text-red-600">{log.error_message}</div>
                    </div>
                  )}

                  {Object.keys(log.sync_details).length > 0 && (
                    <div className="mt-2 p-2 bg-muted rounded text-xs">
                      <div className="font-medium mb-1">Sync Details:</div>
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(log.sync_details, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};