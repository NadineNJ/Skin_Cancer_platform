import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';  // <-- Import FormsModule for ngModel

@Component({
  selector: 'app-doctorslist',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterLink, FormsModule],  // <-- Add FormsModule here
  templateUrl: './doctorslist.component.html',
  styleUrls: ['./doctorslist.component.css']
})
export class DoctorsListComponent implements OnDestroy {
  doctors: any[] = [];
  private intervalId: any;

  // Bind inputs to these variables
  newDoctorName: string = '';
  newDoctorEmail: string = '';
  newDoctorPassword: string = '';

  constructor(private http: HttpClient) {
    this.loadDoctors();
    this.intervalId = setInterval(() => this.loadDoctors(), 10000);
  }

  loadDoctors() {
    const token = localStorage.getItem('access_token');

    this.http.get<any[]>('http://127.0.0.1:5000/doctors', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: (data) => {
        this.doctors = data;
        console.log('Doctors loaded:', data);
      },
      error: (err) => {
        console.error('Failed to load doctors:', err);
        alert('Failed to load doctors. Make sure you are an admin.');
      }
    });
  }

  addDoctor() {
    if (!this.newDoctorName.trim() || !this.newDoctorEmail.trim()) {
      alert('Please enter name and email.');
      return;
    }
  
    const token = localStorage.getItem('access_token');
  
    this.http.post('http://127.0.0.1:5000/doctors', {
      name: this.newDoctorName.trim(),
      email: this.newDoctorEmail.trim(),
      password: 'defaultPass123'  // default password sent silently
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: (res) => {
        console.log('Doctor added:', res);
        this.loadDoctors();
        this.newDoctorName = '';
        this.newDoctorEmail = '';
        // no need to clear password as it’s not user input anymore
      },
      error: (err) => {
        console.error('Failed to add doctor:', err);
        if (err.status === 403) {
          alert('Failed to add doctor. You must be an admin.');
        } else if (err.status === 409) {
          alert('Doctor already exists.');
        } else if (err.status === 400) {
          alert('Missing required fields.');
        } else {
          alert('Failed to add doctor. Please try again.');
        }
      }
    });
  }
  

  deleteDoctor(email: string) {
    const token = localStorage.getItem('access_token');

    this.http.delete(`http://127.0.0.1:5000/doctors/${email}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: () => {
        console.log(`Doctor ${email} deleted`);
        this.loadDoctors();
      },
      error: (err) => {
        console.error('Failed to delete doctor:', err);
        if (err.status === 403) {
          alert('Failed to delete doctor. You must be an admin.');
        } else {
          alert('Failed to delete doctor. Please try again.');
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  scrollToSection(event: Event) {
    event.preventDefault(); // prevent default anchor navigation
    const target = document.getElementById('how-it-works');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }

}
