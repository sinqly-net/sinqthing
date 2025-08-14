import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  Input,
  OnChanges,
} from '@angular/core';

@Directive({
  selector: '[appAutoResizeText]',
})
export class AutoResizeTextDirective implements AfterViewInit, OnChanges {
  @Input() minFontSize = 8;
  @Input() maxFontSize = 32;
  @Input() maxChars = 20;
  private el: ElementRef<HTMLElement> = inject(ElementRef);

  ngAfterViewInit() {
    this.resizeByLength();
  }

  ngOnChanges() {
    this.resizeByLength();
  }

  private resizeByLength() {
    const element = this.el.nativeElement;
    const text = element.innerText || element.textContent || '';
    const length = text.trim().length;

    let newSize = this.maxFontSize;

    if (length > this.maxChars) {
      newSize = (this.maxChars / length) * this.maxFontSize;
    }

    if (newSize < this.minFontSize) {
      newSize = this.minFontSize;
    }

    element.style.fontSize = `${newSize}px`;
  }
}
