import { GenericTrack } from '@utils/interfaces/GenericTrack.interface';
import { GenericDevice } from '@utils/interfaces/GenericDevice.interface';
import { GenericAlbum } from '@utils/interfaces/GenericAlbum.interface';
import { GenericRepeatMode } from '@utils/interfaces/GenericRepeateMode.type';
import { GenericShuffleType } from '@utils/interfaces/GenericShuffle.type';

export interface GenericCurrentlyPlaying {
  isPlaying: boolean;
  progressMs: number;
  track: GenericTrack | null;
  repeatMode?: GenericRepeatMode | null;
  shuffle?: GenericShuffleType;
  device?: GenericDevice;
  album?: GenericAlbum;
}
