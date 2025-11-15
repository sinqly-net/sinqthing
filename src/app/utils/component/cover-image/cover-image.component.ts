import { Component, ElementRef, inject, input, output, ViewChild, } from '@angular/core';
import { Color } from '@utils/interfaces/color.interface';
import { ColorService } from '@utils/services/color.service';

@Component({
  selector: 'app-cover-image',
  imports: [],
  templateUrl: './cover-image.component.html',
  styleUrl: './cover-image.component.scss',
})
export class CoverImageComponent {
  coverImage = input.required<string>();

  dominantColor$ = output<Color | undefined>();

  @ViewChild('cover_img') protected coverImgElementRef?: ElementRef;
  protected dominantColor: Color = { r: 0, g: 0, b: 0 };
  protected darkestColor: Color = { r: 0, g: 0, b: 0 };

  private readonly colorService = inject(ColorService);

  loadColors() {
    if (!this.coverImgElementRef) return;
    this.dominantColor = this.colorService.extractDominantColor(
      this.coverImgElementRef
    );
    this.dominantColor$.emit(this.dominantColor);
    this.darkestColor = this.colorService.extractDarkestColor(
      this.coverImgElementRef
    );
  }

  protected shadowCss(): string {
    return `box-shadow: 0 0 78em 0.2em rgb(${this.dominantColor.r},${this.dominantColor.g},${this.dominantColor.b})`;
  }
}
