import { Injectable } from '@angular/core';
import { SpotifyService } from '@utils/music_provider/spotify/spotify.service';
import { BaseMusicProvider } from '@utils/classes/base-music-provider.abstract';

@Injectable({
  providedIn: 'root',
})
export class MusicProviderRegistryService {
  constructor(private spotifyService: SpotifyService) {}

  getProviderInstance(name: string): BaseMusicProvider | null {
    switch (name) {
      case 'spotify':
        return this.spotifyService;
      // Weitere Provider hier hinzufügen
      default:
        return null;
    }
  }
}
