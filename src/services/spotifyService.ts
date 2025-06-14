
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

export const getSpotifyAuthUrl = () => {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const redirectUri = encodeURIComponent(window.location.origin + '/');
  const scopes = encodeURIComponent('streaming user-read-email user-read-private');
  
  return `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scopes}`;
};

export const extractTokenFromUrl = (): string | null => {
  const hash = window.location.hash;
  if (hash) {
    const params = new URLSearchParams(hash.substring(1));
    return params.get('access_token');
  }
  return null;
};
