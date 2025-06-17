import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Music, ExternalLink, Volume2, VolumeX } from "lucide-react";
import { getPlaylistsForHabit, getSpotifyAccessToken, isSpotifyConnected } from "@/services/spotifyService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Playlist {
  id: string;
  name: string;
  description: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  external_urls: {
    spotify: string;
  };
  tracks: {
    total: number;
  };
}

interface PlaylistRecommendationsProps {
  habitName: string;
  isHabitActive: boolean;
}

const PlaylistRecommendations = ({ habitName, isHabitActive }: PlaylistRecommendationsProps) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const { signInWithSpotify } = useAuth();

  const spotifyConnected = isSpotifyConnected();
  const accessToken = getSpotifyAccessToken();

  useEffect(() => {
    if (isHabitActive && accessToken && musicEnabled) {
      fetchPlaylists();
    }
  }, [isHabitActive, accessToken, habitName, musicEnabled]);

  const fetchPlaylists = async () => {
    if (!accessToken) return;

    setIsLoading(true);
    try {
      const playlistData = await getPlaylistsForHabit(habitName, accessToken);
      setPlaylists(playlistData);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast({
        title: "Error",
        description: "Failed to load playlists. Please try reconnecting to Spotify.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpotifyConnect = async () => {
    const { error } = await signInWithSpotify();
    if (error) {
      console.error("Spotify connection error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to Spotify. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleMusic = () => {
    setMusicEnabled(!musicEnabled);
    if (!musicEnabled && accessToken) {
      fetchPlaylists();
    }
  };

  if (!isHabitActive) {
    return null;
  }

  return (
    <Card className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg font-semibold text-green-800 dark:text-green-400">
            <Music className="w-5 h-5 mr-2" />
            Recommended Playlists for {habitName}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMusic}
            className="flex items-center gap-2"
          >
            {musicEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {musicEnabled ? 'Music On' : 'Music Off'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {!spotifyConnected ? (
          <div className="text-center py-8">
            <Music className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Connect to Spotify to get personalized playlists for your habits
            </p>
            <Button 
              onClick={handleSpotifyConnect} 
              className="bg-[#1DB954] hover:bg-[#1ed760] text-white border-[#1DB954] hover:border-[#1ed760]"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Connect Spotify
            </Button>
          </div>
        ) : !musicEnabled ? (
          <div className="text-center py-8">
            <VolumeX className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-300">Music is turned off</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-600 h-32 rounded-lg mb-2"></div>
                <div className="bg-gray-200 dark:bg-gray-600 h-4 rounded mb-1"></div>
                <div className="bg-gray-200 dark:bg-gray-600 h-3 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : playlists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative mb-3">
                  <img
                    src={playlist.images[0]?.url || '/placeholder.svg'}
                    alt={playlist.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                    <Button
                      size="sm"
                      className="opacity-0 hover:opacity-100 transition-opacity bg-green-500 hover:bg-green-600 rounded-full p-2"
                      onClick={() => window.open(playlist.external_urls.spotify, '_blank')}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <h4 className="font-medium text-sm mb-1 truncate">{playlist.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                  {playlist.description}
                </p>
                <p className="text-xs text-gray-400">{playlist.tracks.total} tracks</p>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 text-xs"
                  onClick={() => window.open(playlist.external_urls.spotify, '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Open in Spotify
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Music className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-300">
              No playlists found for this habit. Try a different habit or check your connection.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlaylistRecommendations;
