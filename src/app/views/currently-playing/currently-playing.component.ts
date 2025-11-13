import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild, } from '@angular/core';
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
import { Color } from '@utils/interfaces/color.interface';

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
  protected dominantColor: Color = { r: 0, g: 0, b: 0 };
  protected darkestColor: Color = { r: 0, g: 0, b: 0 };
  protected mixedColor: Color = { r: 0, g: 0, b: 0 };
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

    return `rgb(${this.mixedColor.r}, ${this.mixedColor.g}, ${this.mixedColor.b})`;
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

  loadColors() {
    this.extractDominantColor();
    this.extractDarkestColor();

    const darkGray = { r: 30, g: 30, b: 30 };

    this.mixedColor = this.mixColors(this.dominantColor, darkGray, 0.8);
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

  protected shadowCss(): string {
    return `box-shadow: 0 0 78em 0.2em rgb(${this.dominantColor.r},${this.dominantColor.g},${this.dominantColor.b})`;
  }

  private mixColors(color1: Color, color2: Color, ratio: number): Color {
    // ratio: 0 = only color-1, 1 = only color-2
    const r = Math.round(color1.r * (1 - ratio) + color2.r * ratio);
    const g = Math.round(color1.g * (1 - ratio) + color2.g * ratio);
    const b = Math.round(color1.b * (1 - ratio) + color2.b * ratio);

    return { r: r, g: g, b: b };
  }

  private extractDarkestColor(): Color | undefined {
    if (!this.coverImgElementRef || !this.loaded) return;

    const img = this.coverImgElementRef.nativeElement as HTMLImageElement;

    // Creating Element not visible in DOM
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let darkest = { r: 0, g: 0, b: 0 };
    let minLuminance = Infinity;

    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      if (a === 0) continue; // ignore transparent

      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      if (luminance < minLuminance) {
        minLuminance = luminance;
        darkest = { r, g, b };
      }
    }

    this.darkestColor = { r: darkest.r, g: darkest.g, b: darkest.b };
    return this.darkestColor;
  }

  private extractDominantColor(): Color | undefined {
    if (!this.coverImgElementRef || !this.loaded) return;

    const imgEl = this.coverImgElementRef.nativeElement;

    const colorThief = new ColorThief();
    const rgb = colorThief.getColor(imgEl);
    this.dominantColor = { r: rgb[0], g: rgb[1], b: rgb[2] };
    return this.dominantColor;
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
