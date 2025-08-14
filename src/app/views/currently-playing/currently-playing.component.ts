import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MusicService } from '@utils/services/music.service'; // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-expect-error
import ColorThief from 'colorthief';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { BaseMusicProvider } from '@utils/classes/base-music-provider.abstract';
import { GenericCurrentlyPlaying } from '@utils/interfaces/GenericCurrentlyPlaying.interface';
import { GenericArtist } from '@utils/interfaces/GenericArtist.interface';
import { GenericPlaybackState } from '@utils/interfaces/GenericPlaybackState.interface';
import { BehaviorSubject } from 'rxjs';
import { AutoResizeTextDirective } from '@utils/directives/auto-resize-text.directive';

@Component({
  selector: 'app-currently-playing',
  imports: [NgClass, AutoResizeTextDirective],
  templateUrl: './currently-playing.component.html',
  styleUrl: './currently-playing.component.scss',
})
export class CurrentlyPlayingComponent implements OnInit, OnDestroy {
  protected readonly musicService = inject(MusicService);
  protected currentlyPlaying: GenericCurrentlyPlaying | null = null;
  protected playbackState: GenericPlaybackState | null = null;
  protected dominantColor = '#000000';
  @ViewChild('cover_img') protected coverImgElementRef?: ElementRef;
  protected progressMs = 0;
  protected isPlaying: boolean | undefined = undefined;
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

  protected get adjustedBackgroundColor(): string | null {
    if (!this.loaded) return null;

    return this.adjustColor(
      this.dominantColor,
      this.getAdjustFactorFromColor(this.dominantColor),
      0.9
    );
  }

  protected get coverImage(): string {
    if (!this.currentlyPlaying || !this.currentlyPlaying.album) return '';
    return this.currentlyPlaying.album.images[0].url;
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

  ngOnInit() {
    this.provider = this.musicService.getProvider();
    if (this.provider) this.provider.enablePulling = true;
    this.loadPlaying();
  }

  ngOnDestroy() {
    if (this.provider) this.provider.enablePulling = false;
    this.stopProgressLoop();
  }

  protected extractDominantColor(): void {
    if (!this.coverImgElementRef || !this.loaded) return;

    const imgEl = this.coverImgElementRef.nativeElement;

    const colorThief = new ColorThief();
    const rgb = colorThief.getColor(imgEl);
    this.dominantColor = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
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

  private adjustColor(
    color: string,
    factor: number,
    intensity: number
  ): string {
    const match = color.match(/\d+/g);

    if (!match || match.length < 3) return color;

    const [r, g, b] = match.map(Number);
    const appliedFactor = factor * intensity;

    const adjustChannel = (channel: number) => {
      if (appliedFactor >= 0) {
        // lighten
        return Math.min(
          255,
          Math.floor(channel + (255 - channel) * appliedFactor)
        );
      } else {
        // darken
        return Math.max(0, Math.floor(channel + channel * appliedFactor));
      }
    };

    return `rgb(${adjustChannel(r)}, ${adjustChannel(g)}, ${adjustChannel(b)})`;
  }

  private getAdjustFactorFromColor(color: string): number {
    const match = color.match(/\d+/g);
    if (!match || match.length < 3) return 0;

    const [r, g, b] = match.map(Number);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    const normalized = luminance / 255;
    return 0.5 - normalized;
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
