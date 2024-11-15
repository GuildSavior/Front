import { Component, inject, OnDestroy } from '@angular/core';
import { LoginService } from '../services/login/login.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnDestroy {

  loginService = inject(LoginService);
  router = inject(Router);
  private logoutSubscription: Subscription | null = null;

  logout(){
    this.logoutSubscription = this.loginService.logout().subscribe({
      next: _ => {
        this.navigateToLogin();
      }, 
      error : _ => {
        this.navigateToLogin();
      }
    })
  }
  navigateToLogin(){
    this.router.navigate(['login'])
  }

  ngOnDestroy(): void {
    console.log("ici avant le unsubscribre");
    this.logoutSubscription?.unsubscribe();
  }

}
