import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BaseProviderStoreAbstract } from '@utils/classes/base-provider-store.abstract';
import { SpotifyPlaybackState } from '@utils/music_provider/spotify/interfaces/SpotifyPlaybackState.interface';
import { SpotifyCurrentlyPlaying } from '@utils/music_provider/spotify/interfaces/SpotifyCurrentlyPlaying.interface';

@Injectable({ providedIn: 'root' })
export class SpotifyStore extends BaseProviderStoreAbstract {
  private readonly currentlyPlayingSubject = new BehaviorSubject<any>(null);
  readonly currentlyPlaying$: Observable<any> =
    this.currentlyPlayingSubject.asObservable();
  private readonly playbackState = new BehaviorSubject<any>(null);
  readonly playbackState$: Observable<any> = this.playbackState.asObservable();

  setCurrentlyPlaying(data: SpotifyCurrentlyPlaying): void {
    this.currentlyPlayingSubject.next(data);
  }

  getCurrentValue(): any {
    return this.currentlyPlayingSubject.value;
  }

  setPlaybackState(data: SpotifyPlaybackState): void {
    this.playbackState.next(data);
  }

  getPlaybackStateValue(): any {
    return this.playbackState.value;
  }
}
