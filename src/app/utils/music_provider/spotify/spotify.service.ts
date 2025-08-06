import { inject, Injectable } from '@angular/core';
import { BaseMusicProvider } from '@utils/classes/base-music-provider.abstract';
import { HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap, tap, timer } from 'rxjs';
import { AuthenticationNotFoundException } from '@utils/exceptions/AuthenticationNotFound.exception';
import {
  AccessToken as SpotifyAccessToken,
  Artist as SpotifyArtist,
} from '@spotify/web-api-ts-sdk';
import { GenericCurrentlyPlaying } from '@utils/interfaces/GenericCurrentlyPlaying.interface';
import { mapSpotifyPlaybackState } from '@utils/music_provider/spotify/adapter/SpotifyPlaybackState.adapter';
import { ProviderStore } from '@utils/stores/provider.store';
import { GenericArtist } from '@utils/interfaces/GenericArtist.interface';
import { mapSpotifySimplifiedArtist } from '@utils/music_provider/spotify/adapter/SpotifyArtist.adapter';
import { SpotifyCurrentlyPlaying } from '@utils/music_provider/spotify/interfaces/SpotifyCurrentlyPlaying.type';
import { mapSpotifyCurrentlyPlaying } from '@utils/music_provider/spotify/adapter/SpotifyCurrentlyPlaying.adapter';
import { SpotifyPlaybackState } from '@utils/music_provider/spotify/interfaces/SpotifyPlaybackState.interface';
import { GenericPlaybackState } from '@utils/interfaces/GenericPlaybackState.interface';

@Injectable({
  providedIn: 'root',
})
export class SpotifyService extends BaseMusicProvider {
  override apiURL = 'https://api.spotify.com/v1';
  private readonly spotifyAccountURL = 'https://accounts.spotify.com';
  private readonly scopes =
    'user-read-currently-playing user-read-playback-state user-modify-playback-state';
  private accessToken: string | null = null;
  private store = inject(ProviderStore);
  private pollingStarted = false;

  constructor() {
    super();
    this.startPolling();
  }

  startPolling(intervalMs = 3000) {
    if (this.pollingStarted) return;
    this.pollingStarted = true;

    timer(0, intervalMs)
      .pipe(
        switchMap(() => {
          if (!this.enablePulling) return of(null);
          return this.getCurrentlyPlaying();
        }),
        catchError(() => of(null))
      )
      .subscribe();

    timer(0, intervalMs)
      .pipe(
        switchMap(() => {
          if (!this.enablePulling) return of(null);
          return this.getPlaybackState();
        }),
        catchError(() => of(null))
      )
      .subscribe();
  }

  override getName(): string {
    return 'spotify';
  }

  override getLabel(): string {
    return 'Spotify';
  }

  login(): void {
    const verifier = this.createRandomString(128);
    this.generateCodeChallenge(verifier).then(challenge => {
      localStorage.setItem('spotify_pkce_verifier', verifier);

      if (!this.clientId) throw new AuthenticationNotFoundException();

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: this.clientId,
        scope: this.scopes,
        redirect_uri: this.redirectUri,
        code_challenge_method: 'S256',
        code_challenge: challenge,
      });

      window.location.href = `${this.spotifyAccountURL}/authorize?${params.toString()}`;
    });
  }

  override callback(): Observable<boolean> {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const verifier = localStorage.getItem('spotify_pkce_verifier');

    if (!code || !verifier) return of(false);

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      code_verifier: verifier,
    });

    return this.http
      .post<SpotifyAccessToken>(
        `${this.spotifyAccountURL}/api/token`,
        body.toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      )
      .pipe(
        map((res: SpotifyAccessToken) => {
          this.accessToken = res.access_token;
          localStorage.setItem('spotify_access_token', res.access_token);

          if (res.refresh_token) {
            localStorage.setItem('spotify_refresh_token', res.refresh_token);
          }

          return true;
        })
      );
  }

  refreshAccessToken(): Observable<string | null> {
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    if (!refreshToken) return of(null);

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId,
    });

    return this.http
      .post<SpotifyAccessToken>(
        `${this.spotifyAccountURL}/api/token`,
        body.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )
      .pipe(
        map(res => {
          this.accessToken = res.access_token;
          localStorage.setItem('spotify_access_token', res.access_token);
          return res.access_token;
        })
      );
  }

  override getPlaybackState(): Observable<GenericPlaybackState> {
    return this.http
      .get<SpotifyPlaybackState>(`${this.apiURL}/me/player`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map(mapSpotifyPlaybackState),
        tap(res => this.store.setPlaybackState(res))
      );
  }

  override getCurrentlyPlaying(): Observable<GenericCurrentlyPlaying> {
    return this.http
      .get<SpotifyCurrentlyPlaying>(
        `${this.apiURL}/me/player/currently-playing`,
        {
          headers: this.getAuthHeaders(),
        }
      )
      .pipe(
        map(mapSpotifyCurrentlyPlaying),
        tap(res => this.store.setCurrentlyPlaying(res))
      );
  }

  getStore(): ProviderStore {
    return this.store;
  }

  override nextSong(): Observable<boolean> {
    return this.http
      .post(
        `${this.apiURL}/me/player/next`,
        {},
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map(() => true),
        catchError(error => {
          if (error.status !== 204) return of(false);
          return of(true);
        })
      );
  }

  override previousSong(): Observable<boolean> {
    return this.http
      .post(
        `${this.apiURL}/me/player/previous`,
        {},
        { headers: this.getAuthHeaders() }
      )
      .pipe(
        map(() => true),
        catchError(error => {
          if (error.status !== 204) return of(false);
          return of(true);
        })
      );
  }

  override pause(): Observable<boolean> {
    return this.http
      .put<string>(`${this.apiURL}/me/player/pause`, null, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map(() => true),
        catchError(error => {
          if (error.status !== 200) return of(false);
          return of(true);
        })
      );
  }

  override resume(): Observable<boolean> {
    return this.http
      .put<string>(`${this.apiURL}/me/player/play`, null, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        map(() => true),
        catchError(error => {
          if (error.status !== 200) return of(false);
          return of(true);
        })
      );
  }

  override getArtist(artist: string): Observable<GenericArtist> {
    return this.http
      .get<SpotifyArtist>(
        `${this.apiURL}/artists/${this.parseArtistFromURI(artist)}`,
        {
          headers: this.getAuthHeaders(),
        }
      )
      .pipe(map(mapSpotifySimplifiedArtist));
  }

  private parseArtistFromURI(artistURI: string): string {
    return artistURI.split(':')[2];
  }

  private getAuthHeaders(): HttpHeaders {
    const token =
      this.accessToken ?? localStorage.getItem('spotify_access_token');

    if (!token) {
      this.refreshAccessToken().subscribe(accessToken => {
        if (!accessToken) return;
        this.accessToken = accessToken;
        localStorage.setItem('spotify_access_token', accessToken);
      });

      throw new AuthenticationNotFoundException();
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
}
