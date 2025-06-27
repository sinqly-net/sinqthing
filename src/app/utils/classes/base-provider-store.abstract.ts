import { BehaviorSubject, Observable } from 'rxjs';

export abstract class BaseProviderStoreAbstract {
  // TODO: add general type
  abstract currentlyPlaying$: Observable<any>;

  // TODO: add general type
  abstract playbackState$: Observable<any>;

  // TODO: add general type
  abstract setCurrentlyPlaying(data: any): void;

  // TODO: add general type
  abstract getCurrentValue(): BehaviorSubject<any>;

  // TODO: add general type
  abstract setPlaybackState(data: any): void;

  // TODO: add general type
  abstract getPlaybackStateValue(): BehaviorSubject<any>;
}
