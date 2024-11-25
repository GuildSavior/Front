import { Component, inject, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Credentials, LoginService } from '../../services/login/login.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DiscordAuthService } from '../../services/discordAuth/discord-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnDestroy{
  
  private loginService = inject(LoginService);
  private router = inject(Router);
  private discordAuth = inject(DiscordAuthService);

  private loginSubscription: Subscription |null = null;
  invalidCredentials = false;
  FormGroup = new FormGroup({
    username : new FormControl('', [Validators.required]),
    password : new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/)])
  })
  login() {
    this.loginSubscription = this.loginService.login( this.FormGroup.value as Credentials ).subscribe({
      next: result => { this.navigateHome(); },
      error: error => { this.invalidCredentials = true; }
    });
  }
  navigateHome(){
    this.router.navigate(['dashboard']);
  }
  isFieldValid(data: string){
    const FormControl = this.FormGroup.get(data);
    return FormControl?.invalid && (FormControl?.dirty || FormControl?.touched);
  }

  discordLog(): void {
    this.discordAuth.loginWithDiscord();
  }

  ngOnDestroy(): void {
    this.loginSubscription?.unsubscribe;
  }
}
