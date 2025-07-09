import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainLayoutComponent } from "./components/layouts/main-layout/main-layout.component";
import { LoginService } from './services/login/login.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MainLayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  loginService = inject(LoginService);
  user = this.loginService.user;
  title = 'GuildSavior';

  ngOnInit(): void {
    console.log(this.user);
  }
}
