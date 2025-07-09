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
import { LandingPageComponent } from './components/landing-features/landing/landing-page.component';

export const routes: Routes = [
  // Routes sans layout
  { path: 'discord-callback', component: DiscordAuthCallbackComponent },
  { path: 'error', component: ErrorComponent },

  // Layout landing (public pages)
  {
    path: '',
    component: LandingLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: LandingPageComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'logout', component: LogoutComponent },
    ],
  },

  // Layout main (après auth)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: DashboardComponent },
    ],
  },

  // Fallback
  { path: '**', redirectTo: 'home' },
];

