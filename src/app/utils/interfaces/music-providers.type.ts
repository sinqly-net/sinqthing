import { BaseMusicProvider } from '@utils/classes/base-music-provider.abstract';
import { SpotifyService } from '@utils/music_provider/spotify/spotify.service';

export type MusicProviderList = 'spotify';

export const availableProviders: Record<
  MusicProviderList,
  typeof BaseMusicProvider
> = {
  spotify: SpotifyService,
};
