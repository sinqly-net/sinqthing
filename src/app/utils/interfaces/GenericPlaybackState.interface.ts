import { GenericDevice } from '@utils/interfaces/GenericDevice.interface';
import { GenericTrack } from '@utils/interfaces/GenericTrack.interface';
import { GenericRepeatMode } from '@utils/interfaces/GenericRepeateMode.type';
import { GenericShuffleType } from '@utils/interfaces/GenericShuffle.type';

export interface GenericPlaybackState {
  device: GenericDevice;
  shuffle?: GenericShuffleType;
  repeatMode: GenericRepeatMode;
  progressMs: number;
  isPlaying: boolean;
  item: GenericTrack;
  currently_playing_type: string;
}
