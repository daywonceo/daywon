import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Zap, 
  Settings, 
  Globe, 
  Smartphone,
  Database,
  Cloud,
  Shield,
  CheckCircle,
  AlertCircle,
  Plus,
  ExternalLink
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'productivity' | 'health' | 'social' | 'analytics' | 'automation';
  provider: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  icon: string;
  features: string[];
  setupComplexity: 'easy' | 'medium' | 'advanced';
  premium: boolean;
  lastSync?: string;
  syncFrequency?: string;
}

interface AdvancedIntegrationsProps {
  userTier?: 'free' | 'basic' | 'pro' | 'enterprise';
}

export const AdvancedIntegrations: React.FC<AdvancedIntegrationsProps> = ({ 
  userTier = 'free' 
}) => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSetup, setShowSetup] = useState<Integration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading integrations
    setTimeout(() => {
      const mockIntegrations: Integration[] = [
        {
          id: 'zapier',
          name: 'Zapier',
          description: 'Automate workflows with 5000+ apps',
          category: 'automation',
          provider: 'Zapier Inc.',
          status: 'connected',
          icon: '⚡',
          features: ['Workflow automation', 'Trigger actions', 'Data sync'],
          setupComplexity: 'easy',
          premium: false,
          lastSync: '2 minutes ago',
          syncFrequency: 'Real-time'
        },
        {
          id: 'notion',
          name: 'Notion',
          description: 'Sync habits with your Notion workspace',
          category: 'productivity',
          provider: 'Notion Labs',
          status: 'disconnected',
          icon: '📝',
          features: ['Database sync', 'Page templates', 'Progress tracking'],
          setupComplexity: 'medium',
          premium: true
        },
        {
          id: 'slack',
          name: 'Slack',
          description: 'Get habit reminders and share progress',
          category: 'social',
          provider: 'Slack Technologies',
          status: 'connected',
          icon: '💬',
          features: ['Daily reminders', 'Progress sharing', 'Team challenges'],
          setupComplexity: 'easy',
          premium: false,
          lastSync: '5 minutes ago',
          syncFrequency: 'Every 15 minutes'
        },
        {
          id: 'oura',
          name: 'Oura Ring',
          description: 'Import sleep and activity data',
          category: 'health',
          provider: 'Oura Health',
          status: 'error',
          icon: '💍',
          features: ['Sleep tracking', 'HRV data', 'Recovery metrics'],
          setupComplexity: 'advanced',
          premium: true,
          lastSync: 'Failed',
          syncFrequency: 'Every hour'
        },
        {
          id: 'whoop',
          name: 'WHOOP',
          description: 'Sync strain and recovery data',
          category: 'health',
          provider: 'WHOOP Inc.',
          status: 'pending',
          icon: '📱',
          features: ['Strain coach', 'Recovery tracking', 'Sleep optimization'],
          setupComplexity: 'advanced',
          premium: true
        },
        {
          id: 'google_analytics',
          name: 'Google Analytics',
          description: 'Track habit completion events',
          category: 'analytics',
          provider: 'Google',
          status: 'disconnected',
          icon: '📊',
          features: ['Event tracking', 'Custom metrics', 'Goal funnels'],
          setupComplexity: 'advanced',
          premium: true
        },
        {
          id: 'airtable',
          name: 'Airtable',
          description: 'Sync data with custom databases',
          category: 'productivity',
          provider: 'Airtable Inc.',
          status: 'connected',
          icon: '🗃️',
          features: ['Custom fields', 'Automation', 'View templates'],
          setupComplexity: 'medium',
          premium: false,
          lastSync: '1 hour ago',
          syncFrequency: 'Every 30 minutes'
        },
        {
          id: 'webhooks',
          name: 'Custom Webhooks',
          description: 'Send data to any HTTP endpoint',
          category: 'automation',
          provider: 'Custom',
          status: 'disconnected',
          icon: '🔗',
          features: ['Real-time events', 'Custom payloads', 'Retry logic'],
          setupComplexity: 'advanced',
          premium: true
        }
      ];
      
      setIntegrations(mockIntegrations);
      setLoading(false);
    }, 1000);
  }, []);

  const toggleIntegration = (integrationId: string) => {
    setIntegrations(integrations.map(integration => 
      integration.id === integrationId 
        ? { 
            ...integration, 
            status: integration.status === 'connected' ? 'disconnected' : 'connected',
            lastSync: integration.status === 'disconnected' ? 'Just now' : undefined
          }
        : integration
    ));
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <div className="h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />;
      default: return <div className="h-4 w-4 border-2 border-muted-foreground rounded-full" />;
    }
  };

  const getComplexityColor = (complexity: Integration['setupComplexity']) => {
    switch (complexity) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const categories = ['all', 'productivity', 'health', 'social', 'analytics', 'automation'];
  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(integration => integration.category === selectedCategory);

  const canUseIntegration = (integration: Integration) => {
    if (!integration.premium) return true;
    return ['pro', 'enterprise'].includes(userTier);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Advanced Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Advanced Integrations
            <Badge variant="secondary" className="ml-auto">
              {filteredIntegrations.filter(i => i.status === 'connected').length} active
            </Badge>
          </CardTitle>
          
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category === 'all' ? 'All' : category}
              </Button>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {filteredIntegrations.map(integration => {
            const available = canUseIntegration(integration);
            
            return (
              <div
                key={integration.id}
                className={`p-4 border rounded-lg ${
                  available ? 'bg-background' : 'bg-muted/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{integration.icon}</div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium ${
                          available ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {integration.name}
                        </h4>
                        {integration.premium && (
                          <Badge variant="outline" className="text-xs">
                            Premium
                          </Badge>
                        )}
                        <Badge 
                          variant="secondary" 
                          className={`${getComplexityColor(integration.setupComplexity)} capitalize text-xs`}
                        >
                          {integration.setupComplexity}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusIcon(integration.status)}
                        {available ? (
                          integration.status === 'connected' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleIntegration(integration.id)}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Configure
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => setShowSetup(integration)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Connect
                            </Button>
                          )
                        ) : (
                          <Button variant="outline" size="sm">
                            Upgrade
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <p className={`text-sm ${
                      available ? 'text-muted-foreground' : 'text-muted-foreground/70'
                    }`}>
                      {integration.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {integration.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    {integration.status === 'connected' && integration.lastSync && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Last sync: {integration.lastSync}</span>
                        <span>Frequency: {integration.syncFrequency}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      {showSetup && (
        <Dialog open={!!showSetup} onOpenChange={() => setShowSetup(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect {showSetup.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl">{showSetup.icon}</div>
                <div>
                  <div className="font-medium">{showSetup.name}</div>
                  <div className="text-sm text-muted-foreground">{showSetup.description}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Features</h4>
                <div className="space-y-1">
                  {showSetup.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Configuration</h4>
                <div className="space-y-2">
                  <Input placeholder="API Key" />
                  <Input placeholder="Webhook URL" />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSetup(null)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toggleIntegration(showSetup.id);
                  setShowSetup(null);
                }}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};