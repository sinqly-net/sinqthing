import { GenericArtist } from '@utils/interfaces/GenericArtist.interface';

export interface GenericTrack {
  id: string;
  title: string;
  artists: GenericArtist[];
  album: string;
  durationMs: number;
  coverUrl?: string;
  isExplicit?: boolean;
  url?: string;
}
