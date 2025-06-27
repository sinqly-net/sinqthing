import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationNotFoundException } from '@utils/exceptions/AuthenticationNotFound.exception';
import { BaseProviderStoreAbstract } from '@utils/classes/base-provider-store.abstract';

export abstract class BaseMusicProvider {
  abstract readonly apiURL: string;
  protected readonly http = inject(HttpClient);
  protected clientId!: string;
  protected readonly redirectUri = `${window.location.origin}/callback/${this.getName()}`;

  setCredentials(clientId: string): void {
    if (!clientId) throw new AuthenticationNotFoundException();
    this.clientId = clientId;
  }

  abstract getName(): string;

  abstract getLabel(): string;

  // TODO: add general type
  abstract getCurrentlyPlaying(): Observable<any>;

  // TODO: add general type
  abstract getPlaybackState(): Observable<any>;

  abstract nextSong(): Observable<boolean>;

  abstract previousSong(): Observable<boolean>;

  abstract pause(): Observable<null>;

  abstract resume(): Observable<null>;

  // TODO: add general type
  abstract getArtist(artist: any): any;

  abstract getStore(): BaseProviderStoreAbstract;

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
