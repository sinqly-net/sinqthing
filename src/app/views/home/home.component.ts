import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from '@app/app.routes';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected readonly routes = routes;
  private readonly router = inject(Router);

  redirect(link: string): void {
    this.router.navigateByUrl(link);
  }
}
