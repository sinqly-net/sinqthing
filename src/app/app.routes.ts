import { Routes } from '@angular/router';
import { HomeComponent } from '@views/home/home.component';
import { CurrentlyPlayingComponent } from '@views/currently-playing/currently-playing.component';
import { ChooseContentComponent } from '@views/choose-content/choose-content.component';
import { CallbackComponent } from '@views/login/callback/callback.component';
import { ManageProviderComponent } from '@views/manage-provider/manage-provider.component';

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
    data: { navConfig: { title: 'Spielt gerade' } },
  },
  {
    path: 'choose_content',
    component: ChooseContentComponent,
    data: { navConfig: { title: 'Auswählen' } },
  },
  {
    path: 'manage-provider',
    component: ManageProviderComponent,
    data: { navConfig: { title: 'Anbieter' } },
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
