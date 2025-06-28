import { Track } from '@spotify/web-api-ts-sdk';
import { GenericTrack } from '@utils/interfaces/GenericTrack.interface';
import { mapSpotifySimplifiedArtist } from './SpotifyArtist.adapter';

export function mapSpotifyTrack(track: Track): GenericTrack {
  return {
    id: track.id,
    title: track.name,
    artists: track.artists.map(mapSpotifySimplifiedArtist),
    album: track.album?.name ?? '',
    durationMs: track.duration_ms,
    coverUrl: track.album?.images?.[0]?.url,
    isExplicit: track.explicit,
    url: track.external_urls?.spotify,
  };
}
