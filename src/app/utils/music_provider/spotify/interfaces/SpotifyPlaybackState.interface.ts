import { Actions, Context, Device, Track } from '@spotify/web-api-ts-sdk';
import { SpotifyRepeatMode } from '@utils/music_provider/spotify/interfaces/SpotifyRepeatMode.type';

export interface SpotifyPlaybackState {
  device: Device;
  shuffle_state: boolean;
  smart_shuffle: boolean;
  repeatMode: SpotifyRepeatMode;
  context: Context | null;
  progressMs: number;
  isPlaying: boolean;
  item: Track;
  currently_playing_type: string;
  actions: Actions;
}
