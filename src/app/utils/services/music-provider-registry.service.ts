import { inject, Injectable } from '@angular/core';
import { SpotifyService } from '@utils/music_provider/spotify/spotify.service';
import { BaseMusicProvider } from '@utils/classes/base-music-provider.abstract';

@Injectable({
  providedIn: 'root',
})
export class MusicProviderRegistryService {
  private spotifyService = inject(SpotifyService);

  getProviderInstance(name: string): BaseMusicProvider | null {
    switch (name) {
      case 'spotify':
        return this.spotifyService;
      default:
        return null;
    }
  }
}
