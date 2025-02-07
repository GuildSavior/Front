import { Component, inject, OnDestroy } from '@angular/core';
import { LoginService } from '../services/login/login.service';
import { Subscription } from 'rxjs';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  loginService = inject(LoginService);
  router = inject(Router);
  private logoutSubscription: Subscription | null = null;

}
