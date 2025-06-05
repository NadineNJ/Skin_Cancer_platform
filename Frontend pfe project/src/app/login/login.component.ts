import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClientModule, HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../home/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  message: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}
  onSubmit() {
    const payload = {
      email: this.email,
      password: this.password
    };
  
    const apiUrl = 'http://127.0.0.1:5000/login';
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
    this.http.post(apiUrl, payload, { headers })
      .pipe(catchError(this.handleError))
      .subscribe({
        next: (response: any) => {
          this.message = 'Login successful!';
          console.log('Response:', response);
  
          // ✅ Store access_token
          if (response.access_token) {
            localStorage.setItem('access_token', response.access_token);
          } else {
            console.error('No access token received.');
            this.message = 'Login failed: Token not provided.';
            return;
          }
  
          // ✅ Store user role
          if (response.role) {
            localStorage.setItem('role', response.role);
          } else {
            console.warn('No role returned from backend. Defaulting to "user".');
            localStorage.setItem('role', 'user'); // fallback
          }
  
          this.email = '';
          this.password = '';
          this.showPassword = false;
  
          this.authService.login();  // Optional
          this.router.navigate(['/home']);
        },
        error: (error: any) => {
          this.message = `Login failed: ${error}`;
          console.error('Error:', error);
          setTimeout(() => this.message = null, 5000);
        }
      });
  }
  scrollToSection(event: Event) {
    event.preventDefault(); // prevent default anchor navigation
    const target = document.getElementById('how-it-works');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else if (typeof error.error === 'string') {
      errorMessage = error.error;
    } else if (error.error && error.error.error) {
      errorMessage = error.error.error;
    } else {
      errorMessage = `Server returned code: ${error.status}, error message: ${error.message}`;
    }
    return throwError(() => errorMessage);
  }
}
