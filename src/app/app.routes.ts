import { Routes } from '@angular/router';
import { HomeComponent } from '@views/home/home.component';
import { CurrentlyPlayingComponent } from '@views/currently-playing/currently-playing.component';
import { ChooseContentComponent } from '@views/choose-content/choose-content.component';
import { SpotifyCallbackComponent } from '@utils/music_provider/spotify/components/spotify-callback/spotify-callback.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'currently_playing',
    component: CurrentlyPlayingComponent,
  },
  {
    path: 'choose_content',
    component: ChooseContentComponent,
  },
  // TODO: replace with one component for all provider
  {
    path: 'callback',
    children: [
      {
        path: 'spotify',
        component: SpotifyCallbackComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
