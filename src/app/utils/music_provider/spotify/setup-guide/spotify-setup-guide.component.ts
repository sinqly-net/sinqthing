import { Component, inject, OnInit } from '@angular/core';
import { BaseProviderSetupGuide } from '@utils/classes/base-provider-setup-guide.abstract';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MusicService } from '@utils/services/music.service';
import { SpotifyService } from '@utils/music_provider/spotify/spotify.service';

@Component({
  selector: 'provider-spotify-setup-guide',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './spotify-setup-guide.component.html',
  styleUrl: './spotify-setup-guide.component.scss',
})
export class SpotifySetupGuideComponent
  implements BaseProviderSetupGuide, OnInit
{
  input_client_id = new FormControl('', [Validators.required]);
  private readonly musicService = inject(MusicService);
  private readonly spotifyService = inject(SpotifyService);

  ngOnInit(): void {
    const currentClientID =
      this.musicService.getProviderByName('spotify')?.getCredentials() ?? null;
    this.input_client_id.setValue(currentClientID);
  }

  setupSpotify() {
    if (!this.input_client_id.valid || !this.input_client_id.value) return;
    this.musicService.registerProvider('spotify', this.input_client_id.value);
    this.spotifyService.login();
  }
}
