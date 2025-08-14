import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  Input,
  OnDestroy,
} from '@angular/core';

@Directive({
  selector: '[appAutoResizeText]',
})
export class AutoResizeTextDirective implements AfterViewInit, OnDestroy {
  @Input() minFontSize = 8;
  @Input() maxFontSize = 32;
  @Input() maxChars = 20;
  private el: ElementRef<HTMLElement> = inject(ElementRef);

  private observer = new MutationObserver(() => {
    this.resizeByLength();
  });

  ngAfterViewInit() {
    this.resizeByLength();

    this.observer.observe(this.el.nativeElement, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
    });
  }

  ngOnDestroy() {
    this.observer.disconnect();
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
