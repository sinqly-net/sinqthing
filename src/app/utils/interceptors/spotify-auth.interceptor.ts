// src/app/interceptors/spotify-auth.interceptor.ts
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { SpotifyService } from '@utils/music_provider/spotify/spotify.service';
import { catchError, Observable, switchMap, throwError } from 'rxjs';

export const spotifyAuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  if (req.url.includes('/api/token')) {
    return next(req);
  }

  const spotifyService = inject(SpotifyService);

  const token = localStorage.getItem('spotify_access_token');
  const cloned = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return spotifyService.refreshAccessToken().pipe(
          switchMap(newToken => {
            if (!newToken) return throwError(() => error);

            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            });

            return next(retryReq);
          }),
          catchError(err =>
            throwError(() => {
              if (err.error.error === 'invalid_grant') {
                spotifyService.login();
              }
              return err;
            })
          )
        );
      }

      return throwError(() => error);
    })
  );
};
