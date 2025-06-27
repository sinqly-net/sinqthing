export interface MusicProviderAdapter {
  play(): void;

  pause(): void;

  next(): void;

  previous(): void;

  getLabel(): string;
}
