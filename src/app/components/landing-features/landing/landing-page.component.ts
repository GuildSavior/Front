import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from "../header/header.component";
import { OurFeaturesComponent } from "../our-features/our-features.component";
import { PlanShowcaseComponent } from "../plan-showcase/plan-showcase.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [HeaderComponent, OurFeaturesComponent, PlanShowcaseComponent, CommonModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent implements OnInit {
  notification: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['payment'] === 'cancel') {
        this.notification = 'Paiement annulé ou échoué.';
        // Nettoie l’URL
        this.router.navigate([], { queryParams: {} });
      }
    });
  }
}
