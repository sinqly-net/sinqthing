import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GenericCurrentlyPlaying } from '@utils/interfaces/GenericCurrentlyPlaying.interface';
import { GenericPlaybackState } from '@utils/interfaces/GenericPlaybackState.interface';

@Injectable({ providedIn: 'root' })
export class ProviderStore {
  private readonly currentlyPlayingSubject =
    new BehaviorSubject<GenericCurrentlyPlaying | null>(null);
  readonly currentlyPlaying$: Observable<GenericCurrentlyPlaying | null> =
    this.currentlyPlayingSubject.asObservable();
  private readonly playbackState =
    new BehaviorSubject<GenericPlaybackState | null>(null);
  readonly playbackState$: Observable<GenericPlaybackState | null> =
    this.playbackState.asObservable();

  setCurrentlyPlaying(data: GenericCurrentlyPlaying): void {
    this.currentlyPlayingSubject.next(data);
  }

  getCurrentValue(): GenericCurrentlyPlaying | null {
    return this.currentlyPlayingSubject.value;
  }

  setPlaybackState(data: GenericPlaybackState): void {
    this.playbackState.next(data);
  }

  getPlaybackStateValue(): GenericPlaybackState | null {
    return this.playbackState.value;
  }
}
