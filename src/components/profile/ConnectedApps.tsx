
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, Dumbbell, Calendar, CheckSquare, Brain } from "lucide-react";
import { toast } from "sonner";

const INTEGRATIONS = [
  {
    name: "MyFitnessPal",
    icon: Dumbbell,
    color: "#0072C6",
    description: "Track nutrition and calories"
  },
  {
    name: "Google Fit",
    icon: Dumbbell,
    color: "#4285F4",
    description: "Sync fitness activities"
  },
  {
    name: "Google Calendar",
    icon: Calendar,
    color: "#4285F4",
    description: "Schedule and reminders"
  },
  {
    name: "Todoist",
    icon: CheckSquare,
    color: "#E44332",
    description: "Task management"
  },
  {
    name: "Headspace",
    icon: Brain,
    color: "#F47D4A",
    description: "Meditation and mindfulness"
  }
];

const ConnectedApps = () => {
  const handleConnect = (appName: string) => {
    toast.info(`Connecting to ${appName}...`);
  };

  const handleDisconnect = (appName: string) => {
    toast.info(`Disconnecting from ${appName}...`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Link className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Connected Apps</h3>
      </div>
      
      <div className="space-y-3">
        {INTEGRATIONS.map((app) => {
          const Icon = app.icon;
          const isConnected = false; // You can add state management here
          
          return (
            <Card key={app.name} className="glass-card group hover:scale-105 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-5 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundColor: `${app.color}20` }}></div>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative z-10" style={{ backgroundColor: app.color }}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{app.name}</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-muted-foreground'} animate-pulse`}></div>
                        <p className="text-sm text-muted-foreground">
                          {isConnected ? "Connected" : app.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  {isConnected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(app.name)}
                      className="text-destructive border-destructive/20 hover:bg-destructive/10 group/btn"
                    >
                      <Link className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConnect(app.name)}
                      className="text-primary border-primary/20 hover:bg-primary/10 group/btn"
                    >
                      <Link className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                      Connect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ConnectedApps;
