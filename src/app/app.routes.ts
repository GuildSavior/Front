import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/feature-dashboard/dashboard/dashboard.component';
import { DiscordAuthCallbackComponent } from './components/discord-auth-callback/discord-auth-callback.component';
import { ErrorComponent } from './components/error/error.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'toto', component: DiscordAuthCallbackComponent },
    { path: 'error', component: ErrorComponent },
];
