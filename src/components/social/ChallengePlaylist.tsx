import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Music, Plus, Play, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getSpotifyAuthUrl, extractTokenFromUrl } from "@/services/spotifyService";

interface Track {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  external_urls: { spotify: string };
  added_by: string;
  added_at: string;
}

interface PlaylistData {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string }>;
  external_urls: { spotify: string };
  tracks: { total: number };
  recentTracks: Track[];
}

interface ChallengePlaylistProps {
  challengeId: number;
  challengeTitle: string;
  isUserInChallenge: boolean;
  onVictoryPrompt?: () => void;
}

const ChallengePlaylist = ({ challengeId, challengeTitle, isUserInChallenge, onVictoryPrompt }: ChallengePlaylistProps) => {
  const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [trackUrl, setTrackUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);

  const accessToken = localStorage.getItem('spotify_access_token');

  useEffect(() => {
    // Check for Spotify token in URL on component mount
    const token = extractTokenFromUrl();
    if (token) {
      localStorage.setItem('spotify_access_token', token);
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      toast({
        title: "Spotify Connected! 🎵",
        description: "You can now access challenge playlists",
      });
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      loadPlaylist();
    }
  }, [challengeId, accessToken]);

  const handleConnectSpotify = () => {
    const authUrl = getSpotifyAuthUrl();
    window.location.href = authUrl;
  };

  const loadPlaylist = async () => {
    if (!accessToken) return;

    setIsLoading(true);
    try {
      // In a real implementation, you would store playlist IDs in your database
      // For now, we'll simulate with a mock playlist
      const mockPlaylist: PlaylistData = {
        id: `challenge_${challengeId}`,
        name: `${challengeTitle} Victory Songs`,
        description: `Shared playlist for ${challengeTitle} challenge participants`,
        images: [{ url: '/placeholder.svg' }],
        external_urls: { spotify: '#' },
        tracks: { total: 12 },
        recentTracks: [
          {
            id: '1',
            name: "Eye of the Tiger",
            artists: [{ name: "Survivor" }],
            external_urls: { spotify: '#' },
            added_by: "Sarah M.",
            added_at: "2 hours ago"
          },
          {
            id: '2',
            name: "Stronger",
            artists: [{ name: "Kelly Clarkson" }],
            external_urls: { spotify: '#' },
            added_by: "Mike R.",
            added_at: "5 hours ago"
          },
          {
            id: '3',
            name: "Thunder",
            artists: [{ name: "Imagine Dragons" }],
            external_urls: { spotify: '#' },
            added_by: "Alex K.",
            added_at: "1 day ago"
          }
        ]
      };
      setPlaylist(mockPlaylist);
    } catch (error) {
      console.error('Error loading playlist:', error);
      toast({
        title: "Error",
        description: "Failed to load challenge playlist",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchTracks = async (query: string) => {
    if (!accessToken || !query.trim()) return;

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.tracks.items);
      }
    } catch (error) {
      console.error('Error searching tracks:', error);
    }
  };

  const addTrackToPlaylist = async (trackId: string, trackName: string) => {
    if (!accessToken || !playlist) return;

    try {
      // In a real implementation, you would call the Spotify API:
      // const response = await fetch(
      //   `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
      //   {
      //     method: 'POST',
      //     headers: {
      //       'Authorization': `Bearer ${accessToken}`,
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({
      //       uris: [`spotify:track:${trackId}`]
      //     })
      //   }
      // );

      toast({
        title: "Victory Song Added! 🎉",
        description: `"${trackName}" has been added to the challenge playlist`,
      });

      setShowAddTrack(false);
      setTrackUrl('');
      setSearchQuery('');
      setSearchResults([]);
      loadPlaylist(); // Refresh playlist
    } catch (error) {
      console.error('Error adding track:', error);
      toast({
        title: "Error",
        description: "Failed to add track to playlist",
        variant: "destructive"
      });
    }
  };

  const extractTrackId = (url: string) => {
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  const handleUrlSubmit = () => {
    const trackId = extractTrackId(trackUrl);
    if (trackId) {
      addTrackToPlaylist(trackId, 'Your Victory Song');
    } else {
      toast({
        title: "Invalid URL",
        description: "Please paste a valid Spotify track link",
        variant: "destructive"
      });
    }
  };

  if (!accessToken) {
    return (
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <CardContent className="p-4 text-center">
          <Music className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Connect Spotify to see challenge playlists
          </p>
          <Button 
            onClick={handleConnectSpotify}
            className="bg-[#1DB954] hover:bg-[#1ed760] text-white border-[#1DB954] hover:border-[#1ed760]"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Connect Spotify
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="bg-gray-200 dark:bg-gray-600 h-4 rounded w-3/4"></div>
            <div className="bg-gray-200 dark:bg-gray-600 h-3 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!playlist) return null;

  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-sm font-semibold text-green-800 dark:text-green-400">
            <Music className="w-4 h-4 mr-2" />
            Victory Playlist
          </CardTitle>
          {isUserInChallenge && (
            <Dialog open={showAddTrack} onOpenChange={setShowAddTrack}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-green-500 hover:bg-green-600 text-xs px-3 py-1 h-7">
                  <Plus className="w-3 h-3 mr-1" />
                  Add Song
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Your Victory Song! 🎉</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Paste Spotify Track Link</label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="https://open.spotify.com/track/..."
                        value={trackUrl}
                        onChange={(e) => setTrackUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleUrlSubmit} disabled={!trackUrl.trim()}>
                        Add
                      </Button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or search</span>
                    </div>
                  </div>
                  
                  <div>
                    <Input
                      placeholder="Search for a song..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (e.target.value.length > 2) {
                          searchTracks(e.target.value);
                        }
                      }}
                    />
                    {searchResults.length > 0 && (
                      <div className="mt-2 max-h-48 overflow-y-auto border rounded-md">
                        {searchResults.map((track) => (
                          <div
                            key={track.id}
                            className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                            onClick={() => addTrackToPlaylist(track.id, track.name)}
                          >
                            <div className="font-medium text-sm">{track.name}</div>
                            <div className="text-xs text-gray-500">
                              {track.artists.map(a => a.name).join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-start space-x-3 mb-4">
          <img
            src={playlist.images[0]?.url || '/placeholder.svg'}
            alt={playlist.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm mb-1 truncate">{playlist.name}</h4>
            <p className="text-xs text-gray-500 mb-2">{playlist.tracks.total} songs</p>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs px-3 py-1 h-7"
                onClick={() => window.open(playlist.external_urls.spotify, '_blank')}
              >
                <Play className="w-3 h-3 mr-1" />
                Listen
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs px-3 py-1 h-7"
                onClick={() => window.open(playlist.external_urls.spotify, '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Open
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Victory Songs</h5>
          <div className="space-y-2">
            {playlist.recentTracks.map((track) => (
              <div key={track.id} className="flex items-center justify-between py-1">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{track.name}</div>
                  <div className="text-xs text-gray-500">
                    by {track.artists.map(a => a.name).join(', ')}
                  </div>
                </div>
                <div className="text-xs text-gray-400 ml-2">
                  {track.added_by} • {track.added_at}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChallengePlaylist;
