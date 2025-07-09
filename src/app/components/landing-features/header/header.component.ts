import { Component } from '@angular/core';
import { WhitebarComponent } from "../../tool/whitebar/whitebar.component";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [WhitebarComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  imageSrc = 'assets/images/iphone.png'
}
