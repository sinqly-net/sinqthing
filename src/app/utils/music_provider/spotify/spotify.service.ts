import { inject, Injectable } from '@angular/core';
import { BaseMusicProvider } from '@utils/classes/base-music-provider.abstract';
import { HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap, tap, timer } from 'rxjs';
import { AuthenticationNotFoundException } from '@utils/exceptions/AuthenticationNotFound.exception';
import { SpotifyStore } from '@utils/music_provider/spotify/spotify.store';
import { BaseProviderStoreAbstract } from '@utils/classes/base-provider-store.abstract';
import { SpotifyPlaybackState } from '@utils/music_provider/spotify/interfaces/SpotifyPlaybackState.interface';
import { SpotifyCurrentlyPlaying } from '@utils/music_provider/spotify/interfaces/SpotifyCurrentlyPlaying.interface';
import { SpotifyComplexArtist } from '@utils/music_provider/spotify/interfaces/SpotifyArtist.interface';

@Injectable({
  providedIn: 'root',
})
export class SpotifyService extends BaseMusicProvider {
  override apiURL = 'https://api.spotify.com/v1';
  private readonly spotifyAccountURL = 'https://accounts.spotify.com';
  private readonly scopes =
    'user-read-currently-playing user-read-playback-state user-modify-playback-state';
  private accessToken: string | null = null;
  private store = inject(SpotifyStore);
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
        switchMap(() => this.getCurrentlyPlaying()),
        catchError(() => of(null))
      )
      .subscribe();

    timer(0, intervalMs)
      .pipe(
        switchMap(() => this.getPlaybackState()),
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

  handleCallback(): Observable<boolean> {
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

    // TODO: add type
    return this.http
      .post<any>(`${this.spotifyAccountURL}/api/token`, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .pipe(
        map(res => {
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

    //TODO: add type
    return this.http
      .post<any>(`${this.spotifyAccountURL}/api/token`, body.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .pipe(
        map(res => {
          this.accessToken = res.access_token;
          localStorage.setItem('spotify_access_token', res.access_token);
          return res.access_token;
        })
      );
  }

  override getPlaybackState(): Observable<SpotifyPlaybackState> {
    return this.http
      .get<SpotifyPlaybackState>(`${this.apiURL}/me/player`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(tap(res => this.store.setPlaybackState(res)));
  }

  override getCurrentlyPlaying(): Observable<SpotifyCurrentlyPlaying> {
    return this.http
      .get<SpotifyCurrentlyPlaying>(
        `${this.apiURL}/me/player/currently-playing`,
        {
          headers: this.getAuthHeaders(),
        }
      )
      .pipe(tap(res => this.store.setCurrentlyPlaying(res)));
  }

  getStore(): BaseProviderStoreAbstract {
    return this.store;
  }

  override nextSong(): Observable<any> {
    console.log('[Spotify] Next song');
    return of(true);
  }

  override previousSong(): Observable<any> {
    console.log('[Spotify] Previous song');
    return of(true);
  }

  override pause(): Observable<null> {
    return this.http.put<null>(`${this.apiURL}/me/player/pause`, null, {
      headers: this.getAuthHeaders(),
    });
  }

  override resume(): Observable<null> {
    return this.http.put<null>(`${this.apiURL}/me/player/play`, null, {
      headers: this.getAuthHeaders(),
    });
  }

  override getArtist(artist: string): Observable<SpotifyComplexArtist> {
    return this.http.get<SpotifyComplexArtist>(
      `${this.apiURL}/artists/${this.parseArtistFromURI(artist)}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
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
