import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscordAuthCallbackComponent } from './discord-auth-callback.component';

describe('DiscordAuthCallbackComponent', () => {
  let component: DiscordAuthCallbackComponent;
  let fixture: ComponentFixture<DiscordAuthCallbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscordAuthCallbackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscordAuthCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
