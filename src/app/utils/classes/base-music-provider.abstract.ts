import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationNotFoundException } from '@utils/exceptions/AuthenticationNotFound.exception';
import { ProviderStore } from '@utils/stores/provider.store';
import { GenericArtist } from '@utils/interfaces/GenericArtist.interface';
import { GenericCurrentlyPlaying } from '@utils/interfaces/GenericCurrentlyPlaying.interface';
import { GenericPlaybackState } from '@utils/interfaces/GenericPlaybackState.interface';
import { BaseProviderSetupGuide } from '@utils/classes/base-provider-setup-guide.abstract';

export abstract class BaseMusicProvider {
  abstract readonly apiURL: string;
  public enablePulling = false;
  protected readonly http = inject(HttpClient);
  protected clientId!: string;
  protected readonly redirectUri = `${window.location.origin}/callback/${this.getName()}`;

  setCredentials(clientId: string): void {
    if (!clientId) throw new AuthenticationNotFoundException();
    this.clientId = clientId;
  }

  abstract getName(): string;

  abstract getLabel(): string;

  abstract getCurrentlyPlaying(): Observable<GenericCurrentlyPlaying>;

  abstract getPlaybackState(): Observable<GenericPlaybackState>;

  abstract nextSong(): Observable<boolean>;

  abstract previousSong(): Observable<boolean>;

  abstract pause(): Observable<boolean>;

  abstract resume(): Observable<boolean>;

  abstract getArtist(artist: string): Observable<GenericArtist>;

  abstract getStore(): ProviderStore;

  abstract getSetupGuideComponent(): typeof BaseProviderSetupGuide;

  abstract getCredentials(): string | null;

  abstract isTrackFavorite(id: string): Observable<boolean>;

  abstract toggleTrackFavorite(id: string): void;

  callback?(): Observable<boolean>;

  createRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
