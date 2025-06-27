import {
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MusicService } from '@utils/services/music.service';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-expect-error
import ColorThief from 'colorthief';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { BaseMusicProvider } from '@utils/classes/base-music-provider.abstract';

@Component({
  selector: 'app-currently-playing',
  imports: [NgClass],
  templateUrl: './currently-playing.component.html',
  styleUrl: './currently-playing.component.scss',
})
export class CurrentlyPlayingComponent implements OnInit, OnDestroy {
  protected readonly musicService = inject(MusicService);
  //TODO replace with custom type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected currentlyPlaying: any = null;
  //TODO replace with custom type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected playbackState: any = null;
  protected dominantColor = '#000000';
  @ViewChild('cover_img') protected coverImgElementRef?: ElementRef;
  protected progressMs = 0;
  protected paused = false;
  private readonly router = inject(Router);
  private animationFrameId: number | null = null;
  private provider: BaseMusicProvider | undefined;

  protected get loaded(): boolean {
    return this.currentlyPlaying && this.playbackState;
  }

  protected get buttonClasses(): object {
    return {
      'cursor-pointer': this.loaded,
      'text-gray-500': !this.loaded,
    };
  }

  protected get shuffleClasses(): object {
    return {
      'text-green-500': this.playbackState.shuffle_state ?? false,
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
    return this.currentlyPlaying.item.album.images[0].url;
  }

  protected get songName(): string {
    return this.currentlyPlaying.item.name;
  }

  protected get albumName(): string {
    return this.currentlyPlaying.item.album.name;
  }

  //TODO replace with custom type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected get artists(): any[] {
    return this.currentlyPlaying.item.artists;
  }

  ngOnInit() {
    this.loadPlaying();
    this.provider = this.musicService.getProvider();
  }

  ngOnDestroy() {
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
    if (!this.provider) return;

    if (this.currentlyPlaying && !this.paused) {
      this.provider.pause().subscribe(() => {
        setTimeout(() => this.loadPlaying(), 5);
      });

      this.paused = true;
    } else {
      this.provider.resume().subscribe(() => {
        setTimeout(() => this.loadPlaying(), 5);
      });

      this.paused = false;
    }
  }

  protected onReturnClicked(): void {
    this.router.navigateByUrl('/home');
  }

  protected onBackwardClicked(): void {}

  protected onForwardClicked(): void {}

  protected onFavoriteClicked(): void {}

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

  private loadPlaying() {
    this.musicService.getCurrentlyPlaying().subscribe(data => {
      if (!data) return;

      this.currentlyPlaying = data;
      this.paused = !data.is_playing;
      this.progressMs = data.progress_ms ?? 0;

      if (data.is_playing) {
        this.startProgressLoop();
      } else {
        this.stopProgressLoop();
      }
    });

    this.musicService.getPlaybackState().subscribe(data => {
      if (!data) return;

      this.playbackState = data;
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
