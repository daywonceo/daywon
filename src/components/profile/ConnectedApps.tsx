
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, Music, LogOut } from "lucide-react";
import { toast } from "sonner";

interface ConnectedAppsProps {
  isSpotifyConnected: boolean;
}

const ConnectedApps = ({ isSpotifyConnected }: ConnectedAppsProps) => {
  const handleConnectSpotify = () => {
    toast.info("Connecting to Spotify...");
  };

  const handleDisconnectSpotify = () => {
    toast.info("Disconnecting from Spotify...");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Link className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Connected Apps</h3>
      </div>
      
      <Card className="glass-card group hover:scale-105 transition-all duration-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CardContent className="p-5 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-[#1DB954]/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative z-10">
                  <Music className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-foreground">Spotify</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isSpotifyConnected ? 'bg-[#1DB954]' : 'bg-muted-foreground'} animate-pulse`}></div>
                  <p className="text-sm text-muted-foreground">
                    {isSpotifyConnected ? "Connected" : "Not connected"}
                  </p>
                </div>
              </div>
            </div>
            {isSpotifyConnected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnectSpotify}
                className="text-destructive border-destructive/20 hover:bg-destructive/10 group/btn"
              >
                <LogOut className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                Disconnect
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleConnectSpotify}
                className="text-primary border-primary/20 hover:bg-primary/10 group/btn"
              >
                <Link className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                Connect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectedApps;
