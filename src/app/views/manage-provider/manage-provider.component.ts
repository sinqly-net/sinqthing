import { Component, inject, OnInit } from '@angular/core';
import { MusicService } from '@utils/services/music.service';
import { availableProviders } from '@utils/interfaces/music-providers.type';
import { RouterLink } from '@angular/router';
import { BaseMusicProvider } from '@utils/classes/base-music-provider.abstract';
import { NgComponentOutlet } from '@angular/common';

@Component({
  selector: 'app-manage-provider',
  imports: [RouterLink, NgComponentOutlet],
  templateUrl: './manage-provider.component.html',
  styleUrl: './manage-provider.component.scss',
})
export class ManageProviderComponent implements OnInit {
  protected selected?: BaseMusicProvider;
  protected readonly availableProviders: { key: string; label: string }[] = [];
  private readonly musicService = inject(MusicService);

  ngOnInit() {
    for (const key in availableProviders) {
      const provider = this.musicService.getProviderByName(key);
      if (!provider) return;
      this.availableProviders.push({ key: key, label: provider.getLabel() });
    }
  }

  selectProviderToSetup(provider: string) {
    const selectedProvider = this.musicService.getProviderByName(provider);
    if (!selectedProvider) return;
    this.selected = selectedProvider;
  }

  getSetupComponentFromSelectedProvider() {
    if (!this.selected) return null;
    return this.selected?.getSetupGuideComponent();
  }
}
