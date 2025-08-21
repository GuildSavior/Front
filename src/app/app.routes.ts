import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/feature-dashboard/dashboard/dashboard.component';
import { DiscordAuthCallbackComponent } from './components/discord-auth-callback/discord-auth-callback.component';
import { ErrorComponent } from './components/error/error.component';
import { LogoutComponent } from './components/logout/logout.component';
import { HomeComponent } from './components/home/home.component';
import { GuildComponent } from './components/guild/guild.component';
import { AuthGuard } from './auth.guard';
import { MainLayoutComponent } from './components/layouts/main-layout/main-layout.component';
import { LandingLayoutComponent } from './components/layouts/landing-layout/landing-layout.component';
import { LandingPageComponent } from './components/landing-features/landing/landing-page.component';
import { MembersComponent } from './components/feature-dashboard/options/members/members.component';
import { JoinGuildComponent } from './components/join-guild/join-guild.component';
import { EventsComponent } from './components/feature-dashboard/options/events/events.component';
import { PlayerProfileComponent } from './components/feature-dashboard/player-profile/player-profile.component';
import { AuctionComponent } from './components/feature-dashboard/options/auction/auction.component'; // ✅ NOUVEAU

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
      { path: 'guild', component: GuildComponent },
      { path: 'members', component: MembersComponent },
      { path: 'events', component: EventsComponent },
      { path: 'auction', component: AuctionComponent }, // ✅ NOUVEAU
      { path: 'join-guild/:code', component: JoinGuildComponent },
      { path: 'player/:id', component: PlayerProfileComponent }
    ]
  },

  // Fallback
  { path: '**', redirectTo: 'home' },
];

