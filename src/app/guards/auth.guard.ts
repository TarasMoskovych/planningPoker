import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { AuthService } from './../services/auth.service';
import { SessionService } from '../services/session.service';
import { FirebaseUser } from '../models/firebase.model';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private sessionService: SessionService
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.authService.getUserData()
      .pipe(
        switchMap((data: FirebaseUser) => {
          if (data && !!this.sessionService.getSessionId()) {
            return of(true);
          }

          this.redirectToHomePage();
          return of(false);
        })
      );
  }

  private redirectToHomePage() {
    this.router.navigate(['home']);
  }

}
