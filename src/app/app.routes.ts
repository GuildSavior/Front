import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/feature-dashboard/dashboard/dashboard.component';
import { DiscordAuthCallbackComponent } from './components/discord-auth-callback/discord-auth-callback.component';
import { ErrorComponent } from './components/error/error.component';
import { LogoutComponent } from './components/logout/logout.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './auth.guard';
import { MainLayoutComponent } from './components/layouts/main-layout/main-layout.component';
import { LandingLayoutComponent } from './components/layouts/landing-layout/landing-layout.component';

export const routes: Routes = [

{
    path: '',
    component: LandingLayoutComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }, 
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: DashboardComponent },
    ],
  },
  { path: '**', redirectTo: 'home' },

  // Routes sans layout (login, register, callback, logout, error)
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'discord-callback', component: DiscordAuthCallbackComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'error', component: ErrorComponent },

];

