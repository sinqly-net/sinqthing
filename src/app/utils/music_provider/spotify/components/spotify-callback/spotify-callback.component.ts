import { Component, inject, OnInit } from '@angular/core';
import { SpotifyService } from '../../spotify.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-spotify-callback',
  template: `<p>Spotify Login wird verarbeitet...</p>`,
})
export class SpotifyCallbackComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly spotify = inject(SpotifyService);

  ngOnInit(): void {
    this.spotify.handleCallback().subscribe((success: any) => {
      if (!success) return;
      this.router.navigate(['/currently_playing']);
    });
  }
}
