import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClientModule, HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HttpClientModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  message: string = '';

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  onRegister() {
    if (this.password !== this.confirmPassword) {
      this.message = 'Passwords do not match.';
      return;
    }

    const payload = {
      name: this.name,            // <-- Added name here
      email: this.email,
      password: this.password
    };

    const apiUrl = 'http://127.0.0.1:5000/register';
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post(apiUrl, payload, { headers })
      .pipe(catchError(this.handleError))
      .subscribe({
        next: (response: any) => {
          this.message = 'Registration successful! Redirecting to login...';

          // Clear form fields
          this.name = '';
          this.email = '';
          this.password = '';
          this.confirmPassword = '';
          this.showPassword = false;
          this.showConfirmPassword = false;

          // Navigate to login page after short delay (optional)
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        },
        error: (error: any) => {
          this.message = `Registration failed: ${error}`;
        }
      });
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
  scrollToSection(event: Event) {
    event.preventDefault(); // prevent default anchor navigation
    const target = document.getElementById('how-it-works');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
