import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  isLoggedIn$: Observable<boolean>;
  isAdmin = false;

  // NEW: Track whether navbar menu is open (for mobile)
  navbarOpen = false;

  constructor(private authService: AuthService, private router: Router) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.isLoggedIn$.subscribe(loggedIn => {
      console.log('Login status:', loggedIn);

      if (loggedIn) {
        const role = localStorage.getItem('role');
        this.isAdmin = role === 'admin';
      } else {
        this.isAdmin = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  scrollToSection(event: Event) {
    event.preventDefault(); // prevent default anchor navigation
    const target = document.getElementById('how-it-works');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // NEW: Toggle navbar open/close on mobile
  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  // NEW: Close navbar when a link is clicked (mobile)
  closeNavbar() {
    this.navbarOpen = false;
  }
}
