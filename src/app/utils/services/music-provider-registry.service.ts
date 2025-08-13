import { inject, Injectable, Injector } from '@angular/core';
import { BaseMusicProvider } from '@utils/classes/base-music-provider.abstract';
import {
  availableProviders,
  MusicProviderList,
} from '@utils/interfaces/music-providers.type';

@Injectable({
  providedIn: 'root',
})
export class MusicProviderRegistryService {
  private readonly injector = inject(Injector);

  getProviderInstance(name: MusicProviderList): BaseMusicProvider | undefined {
    if (!availableProviders[name]) return undefined;
    return this.injector.get<BaseMusicProvider>(availableProviders[name]);
  }
}
