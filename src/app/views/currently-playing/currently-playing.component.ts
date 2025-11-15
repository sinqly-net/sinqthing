import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MusicService } from '@utils/services/music.service';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { BaseMusicProvider } from '@utils/classes/base-music-provider.abstract';
import { GenericCurrentlyPlaying } from '@utils/interfaces/GenericCurrentlyPlaying.interface';
import { GenericArtist } from '@utils/interfaces/GenericArtist.interface';
import { GenericPlaybackState } from '@utils/interfaces/GenericPlaybackState.interface';
import { BehaviorSubject } from 'rxjs';
import { AutoResizeTextDirective } from '@utils/directives/auto-resize-text.directive';
import { CoverImageComponent } from '@utils/component/cover-image/cover-image.component';
import { Color } from '@utils/interfaces/color.interface';
import { ColorService } from '@utils/services/color.service';

@Component({
  selector: 'app-currently-playing',
  imports: [NgClass, AutoResizeTextDirective, CoverImageComponent],
  templateUrl: './currently-playing.component.html',
  styleUrl: './currently-playing.component.scss',
})
export class CurrentlyPlayingComponent implements OnInit, OnDestroy {
  @ViewChild('wrapper') wrapperElement?: ElementRef;

  protected readonly musicService = inject(MusicService);
  protected currentlyPlaying: GenericCurrentlyPlaying | null = null;
  protected playbackState: GenericPlaybackState | null = null;
  protected progressMs = 0;
  protected isPlaying: boolean | undefined = undefined;
  protected mixedColor: Color = { r: 0, g: 0, b: 0 };
  private readonly colorService = inject(ColorService);
  private readonly router = inject(Router);
  private animationFrameId: number | null = null;
  private provider: BaseMusicProvider | undefined;
  private finishedLoading$ = new BehaviorSubject<boolean>(false);

  protected get loaded(): boolean {
    return (
      this.currentlyPlaying !== null &&
      this.playbackState !== null &&
      this.currentlyPlaying !== undefined &&
      this.playbackState !== undefined
    );
  }

  protected get buttonClasses(): object {
    return {
      'cursor-pointer': this.loaded,
      'text-gray-500': !this.loaded,
    };
  }

  protected get shuffleClasses(): object {
    return {
      'text-green-500': this.playbackState?.shuffle !== 'off',
    };
  }

  protected get songName(): string {
    if (!this.currentlyPlaying || !this.currentlyPlaying.track) return '';
    return this.currentlyPlaying.track.title;
  }

  protected get albumName(): string {
    if (!this.currentlyPlaying || !this.currentlyPlaying.album) return '';
    return this.currentlyPlaying.album.name;
  }

  protected get artists(): GenericArtist[] {
    if (!this.currentlyPlaying || !this.currentlyPlaying.track) return [];
    return this.currentlyPlaying.track.artists;
  }

  protected get coverImage(): string {
    if (!this.currentlyPlaying || !this.currentlyPlaying.album) return '';
    return this.currentlyPlaying.album.images[0].url;
  }

  ngOnInit() {
    this.provider = this.musicService.getProvider();
    if (this.provider) this.provider.enablePulling = true;
    this.loadPlaying();
  }

  ngOnDestroy() {
    if (this.provider) this.provider.enablePulling = false;
    this.stopProgressLoop();
  }

  mixBackground(color: Color | undefined) {
    if (color === undefined) return;
    const darkGray = { r: 30, g: 30, b: 30 };

    this.mixedColor = this.colorService.mixColors(color, darkGray, 0.8);
    if (!this.wrapperElement || !this.wrapperElement.nativeElement.styles)
      return;
    this.wrapperElement.nativeElement.styles.backgroundColor = `rgb(${this.mixedColor.r}, ${this.mixedColor.g}, ${this.mixedColor.b})`;
  }

  protected onPauseClicked() {
    if (!this.provider || !this.currentlyPlaying) return;

    if (this.isPlaying) {
      this.provider.pause().subscribe();
    } else {
      this.provider.resume().subscribe();
    }

    this.isPlaying = !this.isPlaying;
    this.loadPlaying();
  }

  protected onReturnClicked(): void {
    this.router.navigateByUrl('/home');
  }

  protected onBackwardClicked(): void {
    this.provider?.previousSong().subscribe(() => {
      this.loadPlaying();
      this.finishedLoading$.subscribe(() => (this.isPlaying = true));
    });
  }

  protected onForwardClicked(): void {
    this.provider?.nextSong().subscribe(() => {
      this.loadPlaying();
      this.finishedLoading$.subscribe(() => (this.isPlaying = true));
    });
  }

  protected onFavoriteClicked(): void {
    return;
  }

  private loadPlaying(): void {
    this.musicService.getCurrentlyPlaying().subscribe(data => {
      this.finishedLoading$.next(false);

      if (!data) return;

      this.currentlyPlaying = data;
      this.isPlaying = data.isPlaying;
      this.progressMs = data.progressMs ?? 0;

      if (this.isPlaying ?? false) {
        this.startProgressLoop();
      } else {
        this.stopProgressLoop();
      }

      this.musicService.getPlaybackState().subscribe(data => {
        if (!data) return;

        this.playbackState = data;

        this.finishedLoading$.next(true);
      });
    });
  }

  private startProgressLoop() {
    if (this.animationFrameId !== null) return;

    const step = () => {
      this.progressMs += 1000 / 60;
      this.animationFrameId = requestAnimationFrame(step);
    };

    this.animationFrameId = requestAnimationFrame(step);
  }

  private stopProgressLoop() {
    if (this.animationFrameId === null) return;

    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }
}
