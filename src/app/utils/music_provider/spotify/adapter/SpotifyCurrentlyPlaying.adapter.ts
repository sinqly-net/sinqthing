import { Track } from '@spotify/web-api-ts-sdk';
import { GenericCurrentlyPlaying } from '@utils/interfaces/GenericCurrentlyPlaying.interface';
import { mapSpotifyTrack } from './SpotifyTrack.adapter';
import { mapSpotifyDevice } from './SpotifyDevice.adapter';
import { mapSpotifySimplifiedAlbum } from '@utils/music_provider/spotify/adapter/SpotifyAlbum.adapter';
import { GenericRepeatMode } from '@utils/interfaces/GenericRepeateMode.type';
import { mapSpotifyShuffleType } from '@utils/music_provider/spotify/adapter/SpotifyShuffle.adapter';
import { SpotifyCurrentlyPlaying } from '@utils/music_provider/spotify/interfaces/SpotifyCurrentlyPlaying.type';

export function mapSpotifyCurrentlyPlaying(
  spotifyState: SpotifyCurrentlyPlaying
): GenericCurrentlyPlaying {
  return {
    isPlaying: spotifyState.is_playing,
    progressMs: spotifyState.progress_ms ?? 0,
    repeatMode: spotifyState.repeat_state as GenericRepeatMode,
    shuffle: mapSpotifyShuffleType(spotifyState.shuffle_state, false),
    track:
      spotifyState.item?.type === 'track'
        ? mapSpotifyTrack(spotifyState.item as Track)
        : null,
    device: spotifyState.device
      ? mapSpotifyDevice(spotifyState.device)
      : undefined,
    album: mapSpotifySimplifiedAlbum((spotifyState.item as Track).album),
  };
}
