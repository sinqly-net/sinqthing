import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationNotFoundException } from '@utils/exceptions/AuthenticationNotFound.exception';
import { BaseProviderStoreAbstract } from '@utils/classes/base-provider-store.abstract';

export abstract class BaseMusicProvider {
  abstract readonly apiURL: string;
  protected readonly http = inject(HttpClient);
  protected clientId!: string;
  protected readonly redirectUri = `${window.location.origin}/callback_${this.getName()}`;

  setCredentials(clientId: string): void {
    if (!clientId) throw new AuthenticationNotFoundException();
    this.clientId = clientId;
  }

  abstract getName(): string;

  abstract getLabel(): string;

  abstract getCurrentlyPlaying(): Observable<any>;

  abstract getPlaybackState(): Observable<any>;

  abstract nextSong(): Observable<any>;

  abstract previousSong(): Observable<any>;

  abstract pause(): Observable<null>;

  abstract resume(): Observable<null>;

  abstract getArtist(artist: any): any;

  abstract getStore(): BaseProviderStoreAbstract;

  createRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
