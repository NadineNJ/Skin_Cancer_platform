import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../home/auth.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-about-sbi',
  templateUrl: './about-sbi.component.html',
  imports: [CommonModule, RouterLink],
  styleUrls: ['./about-sbi.component.css'] 
})
export class AboutSbiComponent {
    isLoggedIn$: Observable<boolean>;
    isAdmin = false;
  
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
}
