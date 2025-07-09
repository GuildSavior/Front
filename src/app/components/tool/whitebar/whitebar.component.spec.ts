import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhitebarComponent } from './whitebar.component';

describe('WhitebarComponent', () => {
  let component: WhitebarComponent;
  let fixture: ComponentFixture<WhitebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhitebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhitebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
