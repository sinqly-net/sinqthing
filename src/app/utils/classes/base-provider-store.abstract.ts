import { BehaviorSubject, Observable } from 'rxjs';

export abstract class BaseProviderStoreAbstract {
  abstract currentlyPlaying$: Observable<any>;

  abstract playbackState$: Observable<any>;

  abstract setCurrentlyPlaying(data: any): void;

  abstract getCurrentValue(): BehaviorSubject<any>;

  abstract setPlaybackState(data: any): void;

  abstract getPlaybackStateValue(): BehaviorSubject<any>;
}
