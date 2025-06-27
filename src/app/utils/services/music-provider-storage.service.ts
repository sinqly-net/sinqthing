import { Injectable } from '@angular/core';
import { StoredProviderConfig } from '@utils/interfaces/stored-provider-config.interface';

@Injectable({
  providedIn: 'root',
})
export class MusicProviderStorageService {
  private readonly STORAGE_KEY = 'configured_music_providers';

  loadProviders(): StoredProviderConfig[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  saveProviders(configs: StoredProviderConfig[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));
  }

  addOrUpdateProvider(config: StoredProviderConfig): void {
    const current = this.loadProviders();
    const updated = [...current.filter(p => p.name !== config.name), config];
    this.saveProviders(updated);
  }

  removeProvider(name: string): void {
    const updated = this.loadProviders().filter(p => p.name !== name);
    this.saveProviders(updated);
  }
}
