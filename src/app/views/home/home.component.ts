import { Component, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router } from '@angular/router';
import { MusicService } from '@utils/services/music.service';
import { SpotifyService } from '@utils/music_provider/spotify/spotify.service';

@Component({
  selector: 'app-home',
  imports: [NgTemplateOutlet],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly musicService = inject(MusicService);
  private spotifyService = inject(SpotifyService);

  redirect(link: string): void {
    this.router.navigateByUrl(link);
  }

  addSpotifyProvider() {
    this.musicService.registerProvider(
      'spotify',
      '77bbe0dfc72e45d9bc345d11db751462'
    );
  }

  loginSpotify() {
    this.spotifyService.login();
  }
}
