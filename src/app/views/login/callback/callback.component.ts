import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MusicService } from '@utils/services/music.service';

@Component({
  selector: 'app-callback',
  imports: [],
  template: '',
  styles: '',
})
export class CallbackComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly musicService = inject(MusicService);

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      const provider = paramMap.get('provider');
      if (!provider) return;

      const selectedProvider = this.musicService.getProvider();
      if (!selectedProvider || !selectedProvider.callback) return;

      selectedProvider.callback().subscribe(callback => {
        if (!callback) return;
        this.router.navigate(['/currently_playing']);
      });
    });
  }
}
