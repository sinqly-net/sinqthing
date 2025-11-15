import { ElementRef, Injectable } from '@angular/core';
import { Color } from '@utils/interfaces/color.interface';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-expect-error
import ColorThief from 'colorthief';

@Injectable({
  providedIn: 'root',
})
export class ColorService {
  mixColors(color1: Color, color2: Color, ratio: number): Color {
    // ratio: 0 = only color-1, 1 = only color-2
    const r = Math.round(color1.r * (1 - ratio) + color2.r * ratio);
    const g = Math.round(color1.g * (1 - ratio) + color2.g * ratio);
    const b = Math.round(color1.b * (1 - ratio) + color2.b * ratio);

    return { r: r, g: g, b: b };
  }

  extractDarkestColor(coverImgElementRef: ElementRef): Color {
    if (!coverImgElementRef) return { r: 0, g: 0, b: 0 };

    const img = coverImgElementRef.nativeElement as HTMLImageElement;

    // Creating Element not visible in DOM
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return { r: 0, g: 0, b: 0 };

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

    return { r: darkest.r, g: darkest.g, b: darkest.b };
  }

  extractDominantColor(coverImgElementRef: ElementRef): Color {
    if (!coverImgElementRef) return { r: 0, g: 0, b: 0 };

    const imgEl = coverImgElementRef.nativeElement;

    const colorThief = new ColorThief();
    const rgb = colorThief.getColor(imgEl);
    return { r: rgb[0], g: rgb[1], b: rgb[2] };
  }

  adjustColor(color: string, factor: number, intensity: number): Color {
    const match = color.match(/\d+/g);

    if (!match || match.length < 3) return { r: 0, g: 0, b: 0 };

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

    return { r: adjustChannel(r), g: adjustChannel(g), b: adjustChannel(b) };
  }

  getAdjustFactorFromColor(color: string): number {
    const match = color.match(/\d+/g);
    if (!match || match.length < 3) return 0;

    const [r, g, b] = match.map(Number);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    const normalized = luminance / 255;
    return 0.5 - normalized;
  }
}
