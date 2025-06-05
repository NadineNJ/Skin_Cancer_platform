import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$: Observable<boolean> = this.loggedIn.asObservable();

  login() {
    console.log('login called');
    this.loggedIn.next(true);
  }
  
  logout() {
    console.log('logout called');
    this.loggedIn.next(false);
  }
}  