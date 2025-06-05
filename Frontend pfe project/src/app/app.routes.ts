import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { TestComponent } from './test/test.component';
import { LoginComponent } from './login/login.component';
import { AboutSbiComponent } from './about-sbi/about-sbi.component';
import { RegisterComponent } from './register/register.component';
import { DoctorsListComponent } from './doctorslist/doctorslist.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'test', component: TestComponent },
  { path: 'about-sbi', component: AboutSbiComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'doctorslist', component: DoctorsListComponent },  
];
