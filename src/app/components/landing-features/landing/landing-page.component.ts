import { Component } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { OurFeaturesComponent } from "../our-features/our-features.component";
import { PlanShowcaseComponent } from "../plan-showcase/plan-showcase.component";

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [HeaderComponent, OurFeaturesComponent, PlanShowcaseComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {

}
