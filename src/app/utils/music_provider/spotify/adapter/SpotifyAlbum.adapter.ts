import { SimplifiedAlbum } from '@spotify/web-api-ts-sdk';
import { GenericAlbum } from '@utils/interfaces/GenericAlbum.interface';
import { mapSpotifySimplifiedArtist } from '@utils/music_provider/spotify/adapter/SpotifyArtist.adapter';

export function mapSpotifySimplifiedAlbum(
  album: SimplifiedAlbum
): GenericAlbum {
  return {
    id: album.id,
    name: album.name,
    uri: album.uri,
    release_date: new Date(album.release_date),
    images: album.images,
    artists: album.artists.map(mapSpotifySimplifiedArtist),
  };
}
