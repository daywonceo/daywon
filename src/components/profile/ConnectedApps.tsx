
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, Music } from "lucide-react";
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
    <div className="mb-6">
      <div className="flex items-center mb-4">
        <Link className="w-5 h-5 text-green-600 mr-2" />
        <h3 className="text-lg font-bold">Connected Apps</h3>
      </div>
      
      <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold">Spotify</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isSpotifyConnected ? "Connected" : "Not connected"}
                </p>
              </div>
            </div>
            {isSpotifyConnected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnectSpotify}
                className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Disconnect
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleConnectSpotify}
                className="text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
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
