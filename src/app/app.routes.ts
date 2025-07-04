import { Routes } from '@angular/router';
import { HomeComponent } from '@views/home/home.component';
import { CurrentlyPlayingComponent } from '@views/currently-playing/currently-playing.component';
import { ChooseContentComponent } from '@views/choose-content/choose-content.component';
import { CallbackComponent } from '@views/login/callback/callback.component';

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
  {
    path: 'callback/:provider',
    component: CallbackComponent,
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
