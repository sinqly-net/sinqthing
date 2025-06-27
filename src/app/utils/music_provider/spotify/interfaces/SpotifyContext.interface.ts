import { SpotifyExternalUrl } from '@utils/music_provider/spotify/interfaces/SpotifyExternalUrl.interface';

export interface SpotifyContext {
  external_urls: SpotifyExternalUrl;
  href: string;
  type: string;
  uri: string;
}
