import { inject, Injectable } from '@angular/core';
import { MusicProviderRegistryService } from './music-provider-registry.service';
import { MusicProviderStorageService } from './music-provider-storage.service';
import { BaseMusicProvider } from '@utils/classes/base-music-provider.abstract';
import { Observable, of } from 'rxjs';
import { MusicProvider } from '@utils/interfaces/music-providers.type';
import { GenericCurrentlyPlaying } from '@utils/interfaces/GenericCurrentlyPlaying.interface';
import { GenericPlaybackState } from '@utils/interfaces/GenericPlaybackState.interface';

@Injectable({
  providedIn: 'root',
})
export class MusicService {
  private registry = inject(MusicProviderRegistryService);
  private storage = inject(MusicProviderStorageService);
  private providers = new Map<MusicProvider, BaseMusicProvider>();
  private selectedMusicProvider: MusicProvider = 'spotify';

  init(): void {
    const configs = this.storage.loadProviders();

    if (configs.length === 0) return;

    configs.forEach(config => {
      const provider = this.registry.getProviderInstance(config.name);

      if (!provider) return;

      provider.setCredentials(config.clientId);

      this.providers.set(config.name as MusicProvider, provider);
    });
  }

  selectProvider(provider: MusicProvider) {
    this.selectedMusicProvider = provider;
  }

  getProvider(): BaseMusicProvider | undefined {
    return this.providers.get(this.selectedMusicProvider);
  }

  getAllProviders(): BaseMusicProvider[] {
    return Array.from(this.providers.values());
  }

  registerProvider(name: MusicProvider, clientId: string): void {
    const provider = this.registry.getProviderInstance(name);

    if (!provider) return;

    provider.setCredentials(clientId);
    this.providers.set(name, provider);
    this.storage.addOrUpdateProvider({ name, clientId });
  }

  unregisterProvider(name: MusicProvider): void {
    this.providers.delete(name);
    this.storage.removeProvider(name);
  }

  getCurrentlyPlaying(): Observable<GenericCurrentlyPlaying | null> {
    const currentlyPlayingSubject = this.providers
      .get(this.selectedMusicProvider)
      ?.getStore().currentlyPlaying$;
    if (!currentlyPlayingSubject) return of(null);
    return currentlyPlayingSubject;
  }

  getPlaybackState(): Observable<GenericPlaybackState | null> {
    const playbackStateSubject = this.providers
      .get(this.selectedMusicProvider)
      ?.getStore().playbackState$;
    if (!playbackStateSubject) return of(null);
    return playbackStateSubject;
  }
}
