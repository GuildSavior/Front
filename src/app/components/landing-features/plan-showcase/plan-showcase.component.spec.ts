import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanShowcaseComponent } from './plan-showcase.component';

describe('PlanShowcaseComponent', () => {
  let component: PlanShowcaseComponent;
  let fixture: ComponentFixture<PlanShowcaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanShowcaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
