import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/feature-dashboard/dashboard/dashboard.component';
import { DiscordAuthCallbackComponent } from './components/discord-auth-callback/discord-auth-callback.component';
import { ErrorComponent } from './components/error/error.component';
import { LogoutComponent } from './components/logout/logout.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    //{ path: 'dashboard', component: DashboardComponent },
    { path: 'discord-callback', component: DiscordAuthCallbackComponent},
    { path: 'error', component: ErrorComponent },
    { path: 'logout', component: LogoutComponent },
    { path: 'toto', component: DiscordAuthCallbackComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: '**', component: HomeComponent }
];
