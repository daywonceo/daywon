
interface SpotifyPlaylist {
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

interface SpotifyResponse {
  playlists: {
    items: SpotifyPlaylist[];
  };
}

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// Category mappings for different habits
const HABIT_CATEGORIES = {
  WORKOUT: 'workout',
  DEVOTIONS: 'chill',
  READ: 'focus'
};

export const getPlaylistsForHabit = async (habitName: string, accessToken: string): Promise<SpotifyPlaylist[]> => {
  const category = HABIT_CATEGORIES[habitName as keyof typeof HABIT_CATEGORIES] || 'focus';
  
  try {
    const response = await fetch(
      `${SPOTIFY_API_BASE}/browse/categories/${category}/playlists?limit=6`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    const data: SpotifyResponse = await response.json();
    return data.playlists.items;
  } catch (error) {
    console.error('Error fetching Spotify playlists:', error);
    return [];
  }
};

export const getSpotifyAccessToken = (): string | null => {
  return localStorage.getItem('spotify_access_token');
};

export const isSpotifyConnected = (): boolean => {
  const token = getSpotifyAccessToken();
  return !!token;
};

// Remove the old OAuth URL generation and token extraction functions
// as we're now using Supabase OAuth
