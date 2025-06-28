import { mapSpotifyDevice } from './SpotifyDevice.adapter';
import { SpotifyPlaybackState } from '@utils/music_provider/spotify/interfaces/SpotifyPlaybackState.interface';
import { GenericPlaybackState } from '@utils/interfaces/GenericPlaybackState.interface';
import { mapSpotifyShuffleType } from '@utils/music_provider/spotify/adapter/SpotifyShuffle.adapter';
import { mapSpotifyTrack } from '@utils/music_provider/spotify/adapter/SpotifyTrack.adapter';

export function mapSpotifyPlaybackState(
  spotifyState: SpotifyPlaybackState
): GenericPlaybackState {
  return {
    device: mapSpotifyDevice(spotifyState.device),
    shuffle: mapSpotifyShuffleType(
      spotifyState.shuffle_state,
      spotifyState.smart_shuffle
    ),
    repeatMode: spotifyState.repeatMode,
    progressMs: spotifyState.progressMs,
    isPlaying: spotifyState.isPlaying,
    item: mapSpotifyTrack(spotifyState.item),
    currently_playing_type: spotifyState.currently_playing_type,
  };
}
