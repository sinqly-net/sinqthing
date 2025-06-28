import { Artist, SimplifiedArtist } from '@spotify/web-api-ts-sdk';
import { GenericArtist } from '@utils/interfaces/GenericArtist.interface';

export function mapSpotifySimplifiedArtist(
  artist: SimplifiedArtist
): GenericArtist {
  return {
    id: artist.id ?? undefined,
    name: artist.name,
    url: artist.external_urls?.spotify ?? '',
    genres: [], // Genres not available here – only in full artist object
    images: [], // Images also not included – requires separate fetch
  };
}

export function mapSpotifyArtist(artist: Artist): GenericArtist {
  return {
    id: artist.id ?? undefined,
    name: artist.name,
    url: artist.external_urls?.spotify ?? '',
    genres: artist.genres ?? [],
    images: artist.images ?? [],
  };
}
