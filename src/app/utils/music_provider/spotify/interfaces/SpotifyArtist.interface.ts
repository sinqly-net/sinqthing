import { SpotifyExternalUrl } from '@utils/music_provider/spotify/interfaces/SpotifyExternalUrl.interface';
import { SpotifyImage } from './SpotifyImage.interface';

export interface SpotifySimpleArtist {
  external_urls: SpotifyExternalUrl;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

export interface SpotifyComplexArtist {
  external_urls: SpotifyExternalUrl;
  followers: {
    href: string;
    total: number;
  };
  genres: string[];
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  popularity: number;
  type: string;
  uri: string;
}
