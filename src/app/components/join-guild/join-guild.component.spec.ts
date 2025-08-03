import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinGuildComponent } from './join-guild.component';

describe('JoinGuildComponent', () => {
  let component: JoinGuildComponent;
  let fixture: ComponentFixture<JoinGuildComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinGuildComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinGuildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
