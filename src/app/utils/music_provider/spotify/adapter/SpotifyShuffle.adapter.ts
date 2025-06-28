import { GenericShuffleType } from '@utils/interfaces/GenericShuffle.type';

export function mapSpotifyShuffleType(
  shuffle: boolean,
  smart_shuffle: boolean
): GenericShuffleType {
  if (shuffle && !smart_shuffle) return 'shuffle';
  if (shuffle && smart_shuffle) return 'smart_shuffle';
  return 'off';
}
