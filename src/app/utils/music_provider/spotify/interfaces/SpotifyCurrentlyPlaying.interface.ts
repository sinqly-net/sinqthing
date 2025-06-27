import { SpotifyExternalUrl } from '@utils/music_provider/spotify/interfaces/SpotifyExternalUrl.interface';
import { SpotifyContext } from '@utils/music_provider/spotify/interfaces/SpotifyContext.interface';
import { SpotifySimpleArtist } from './SpotifyArtist.interface';
import { SpotifyAlbum } from '@utils/music_provider/spotify/interfaces/SpotifyAlbum.interface';
import { SpotifyActions } from '@utils/music_provider/spotify/interfaces/SpotifyActions.interface';

export interface SpotifyCurrentlyPlaying {
  timestamp: number;
  context: SpotifyContext;
  progress_ms: number;
  item: {
    album: SpotifyAlbum;
    artists: SpotifySimpleArtist[];
    available_markets: string[];
    disc_number: number;
    duration_ms: number;
    explicit: boolean;
    external_ids: Record<string, string>;
    external_urls: SpotifyExternalUrl;
    href: string;
    id: string;
    is_local: boolean;
    name: string;
    popularity: number;
    preview_url: string | null;
    track_number: number;
    type: string;
    uri: string;
  };
  currently_playing_type: string;
  actions: SpotifyActions;
  is_playing: false;
}
