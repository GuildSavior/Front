import { TestBed } from '@angular/core/testing';

import { GuildInvitationService } from './guild-invitation.service';

describe('GuildInvitationService', () => {
  let service: GuildInvitationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GuildInvitationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
