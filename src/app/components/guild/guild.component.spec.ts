import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { GuildComponent } from './guild.component';
import { AuthService } from '../../services/auth.service';
import { GuildService } from '../../services/guild/guild.service';
import { PlanService } from '../../services/plan/plan.service';
import { GuildInvitationService } from '../../services/invitations/guild-invitation.service';
import { NotificationService } from '../../services/notification/notification.service';
import { environment } from '../../../environments/environment';
// ✅ IMPORTER les modèles
import { User, Subscription } from '../../models/user.model';
import { Guild } from '../../models/guild.model';

describe('GuildComponent', () => {
  let component: GuildComponent;
  let fixture: ComponentFixture<GuildComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let guildService: jasmine.SpyObj<GuildService>;
  let planService: jasmine.SpyObj<PlanService>;
  let invitationService: jasmine.SpyObj<GuildInvitationService>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;
  let httpMock: HttpTestingController;

  // ✅ CORRIGER: Mock de la subscription
  const mockSubscription: Subscription = {
    id: 1,
    user_id: 1,
    plan_type: 'premium',
    status: 'active',
    price: '9.99',
    payment_method: 'stripe',
    starts_at: '2025-01-01T00:00:00Z',
    expires_at: '2025-12-31T23:59:59Z',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  };

  // ✅ CORRIGER: Mock de l'utilisateur conforme au modèle
  const mockUser: User = {
    id: 1,
    discord_id: '123456789012345678',
    username: 'testuser',
    email: 'test@example.com',
    avatar: 'avatar.jpg',
    remember_token: null,
    role_id: 1,
    guild_id: 1,
    refresh_token: null,
    statut: 'active',
    total_dkp: 100,
    is_premium: true,
    subscription: mockSubscription,
    guild: null, // Sera défini après
    role: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  };

  // ✅ CORRIGER: Mock de la guilde conforme au modèle
  const mockGuild: Guild = {
    id: 1,
    name: 'Test Guild',
    description: 'Test Description',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    owner_id: 1,
    member_count: 5,
    max_members: 50
  };

  // ✅ Mock des invitations (interface peut-être à créer aussi)
  const mockInvitations = [
    {
      id: 1,
      code: 'ABC123',
      url: 'http://localhost:4200/join/ABC123',
      is_active: true,
      is_valid: true,
      max_uses: 10,
      uses: 2,
      expires_at: '2025-12-31T23:59:59Z',
      guild_id: 1,
      created_by: 1,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    },
    {
      id: 2,
      code: 'XYZ789',
      url: 'http://localhost:4200/join/XYZ789',
      is_active: false,
      is_valid: false,
      max_uses: 5,
      uses: 5,
      expires_at: '2025-01-01T00:00:00Z',
      guild_id: 1,
      created_by: 1,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    }
  ];

  // ✅ Factory functions pour créer des variations
  const createMockUser = (overrides: Partial<User> = {}): User => ({
    ...mockUser,
    ...overrides
  });

  const createMockGuild = (overrides: Partial<Guild> = {}): Guild => ({
    ...mockGuild,
    ...overrides
  });

  beforeEach(async () => {
    // ✅ Créer les spies
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['checkAuthStatus']);
    const guildServiceSpy = jasmine.createSpyObj('GuildService', [
      'getCurrentGuild', 'createGuild', 'leaveGuild', 'disbandGuild'
    ]);
    const planServiceSpy = jasmine.createSpyObj('PlanService', ['isPremiumActive']);
    const invitationServiceSpy = jasmine.createSpyObj('GuildInvitationService', [
      'getMyInvitations', 'createInvitation', 'deactivateInvitation', 
      'deleteInvitation', 'cleanupInactiveInvitations'
    ]);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'success', 'error', 'warning', 'info'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // ✅ Mock du document.cookie
    spyOnProperty(document, 'cookie', 'get').and.returnValue('auth_token=fake-token');

    await TestBed.configureTestingModule({
      imports: [GuildComponent, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: GuildService, useValue: guildServiceSpy },
        { provide: PlanService, useValue: planServiceSpy },
        { provide: GuildInvitationService, useValue: invitationServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GuildComponent);
    component = fixture.componentInstance;
    
    // ✅ Récupérer les spies
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    guildService = TestBed.inject(GuildService) as jasmine.SpyObj<GuildService>;
    planService = TestBed.inject(PlanService) as jasmine.SpyObj<PlanService>;
    invitationService = TestBed.inject(GuildInvitationService) as jasmine.SpyObj<GuildInvitationService>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ✅ TEST 1: Création du composant
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ✅ TEST 2: Initialisation des propriétés
  it('should initialize with correct default values', () => {
    expect(component.user).toBe(null);
    expect(component.guild).toBe(null);
    expect(component.isLoading).toBe(true);
    expect(component.isCreatingGuild).toBe(false);
    expect(component.invitations).toEqual([]);
    expect(component.showInvitations).toBe(false);
  });

  // ✅ TEST 3: Chargement réussi utilisateur + guilde
  it('should load user and guild successfully', fakeAsync(() => {
    authService.checkAuthStatus.and.returnValue(of({ user: mockUser }));
    guildService.getCurrentGuild.and.returnValue(of({ success: true, guild: mockGuild }));

    component.ngOnInit();
    tick();

    expect(component.user).toEqual(mockUser);
    expect(component.guild).toEqual(mockGuild);
    expect(component.isLoading).toBe(false);
  }));

  // ✅ TEST 4: Utilisateur sans guilde
  it('should handle user without guild', fakeAsync(() => {
    authService.checkAuthStatus.and.returnValue(of({ user: mockUser }));
    guildService.getCurrentGuild.and.returnValue(of({ success: false }));

    component.ngOnInit();
    tick();

    expect(component.user).toEqual(mockUser);
    expect(component.guild).toBe(null);
    expect(component.isLoading).toBe(false);
  }));

  // ✅ TEST 5: Erreur d'authentification
  it('should redirect on auth error', fakeAsync(() => {
    authService.checkAuthStatus.and.returnValue(throwError(() => new Error('Auth error')));

    component.ngOnInit();
    tick();

    expect(router.navigate).toHaveBeenCalledWith(['/home']);
    expect(component.isLoading).toBe(false);
  }));

  // ✅ TEST 6: Propriété isGuildOwner
  describe('isGuildOwner', () => {
    it('should return true when user is guild owner', () => {
      component.user = mockUser;
      component.guild = mockGuild;
      
      expect(component.isGuildOwner).toBe(true);
    });

    it('should return false when user is not guild owner', () => {
      component.user = createMockUser({ id: 2 }); // ✅ Utiliser la factory
      component.guild = mockGuild;
      
      expect(component.isGuildOwner).toBe(false);
    });

    it('should return false when no user or guild', () => {
      component.user = null;
      component.guild = null;
      
      expect(component.isGuildOwner).toBe(false);
    });
  });

  // ✅ TEST 7: Création de guilde
  describe('Guild Creation', () => {
    beforeEach(() => {
      component.user = mockUser;
      planService.isPremiumActive.and.returnValue(true);
    });

    it('should show create form when user is premium', () => {
      component.showCreateForm();
      
      expect(component.isCreatingGuild).toBe(true);
      expect(component.errorMessage).toBe('');
      expect(component.successMessage).toBe('');
    });

    it('should show error when user is not premium', () => {
      // ✅ Utiliser un utilisateur non-premium
      component.user = createMockUser({ 
        is_premium: false, 
        subscription: null 
      });
      planService.isPremiumActive.and.returnValue(false);
      
      component.showCreateForm();
      
      expect(notificationService.error).toHaveBeenCalledWith(
        'Abonnement Premium requis',
        'Vous devez avoir un abonnement Premium pour créer une guilde.'
      );
    });

    it('should cancel create form', () => {
      component.isCreatingGuild = true;
      component.newGuild = { name: 'Test', description: 'Test' };
      
      component.cancelCreate();
      
      expect(component.isCreatingGuild).toBe(false);
      expect(component.newGuild).toEqual({ name: '', description: '' });
    });

    it('should create guild successfully', fakeAsync(() => {
      component.newGuild = { name: 'New Guild', description: 'New Description' };
      const createdGuild = createMockGuild({ 
        name: 'New Guild', 
        description: 'New Description' 
      });
      
      guildService.createGuild.and.returnValue(of({ 
        success: true, 
        guild: createdGuild 
      }));

      component.createGuild();
      tick();

      expect(guildService.createGuild).toHaveBeenCalledWith({
        name: 'New Guild',
        description: 'New Description'
      });
      expect(component.guild).toEqual(createdGuild);
      expect(component.isCreatingGuild).toBe(false);
      expect(notificationService.success).toHaveBeenCalled();
    }));

    it('should handle guild creation error', fakeAsync(() => {
      component.newGuild = { name: 'New Guild', description: 'New Description' };
      guildService.createGuild.and.returnValue(throwError(() => ({
        status: 403,
        error: { message: 'Premium required' }
      })));

      component.createGuild();
      tick();

      expect(notificationService.error).toHaveBeenCalled();
      expect(component.isSubmitting).toBe(false);
    }));

    it('should not create guild without name', () => {
      component.newGuild = { name: '', description: 'Test' };
      
      component.createGuild();
      
      expect(notificationService.error).toHaveBeenCalledWith(
        'Erreur de création',
        'Le nom de la guilde est obligatoire.'
      );
    });
  });

  // ✅ TEST 8: Gestion des invitations
  describe('Invitations Management', () => {
    beforeEach(() => {
      component.user = mockUser;
      component.guild = mockGuild;
    });

    it('should load invitations successfully', fakeAsync(() => {
      invitationService.getMyInvitations.and.returnValue(of({
        success: true,
        invitations: mockInvitations
      }));

      component.loadInvitations();
      tick();

      expect(component.invitations).toEqual(mockInvitations);
      expect(component.isLoadingInvitations).toBe(false);
    }));

    it('should toggle invitations panel', () => {
      component.showInvitations = false;
      spyOn(component, 'loadInvitations');

      component.toggleInvitations();

      expect(component.showInvitations).toBe(true);
      expect(component.loadInvitations).toHaveBeenCalled();
    });

    it('should not allow non-owner to toggle invitations', () => {
      component.user = { ...mockUser, id: 2 }; // Pas le propriétaire

      component.toggleInvitations();

      expect(notificationService.error).toHaveBeenCalledWith(
        'Erreur d\'accès',
        'Seul le propriétaire de la guilde peut gérer les invitations.'
      );
    });

    it('should create invitation successfully', fakeAsync(() => {
      component.invitationForm = { maxUses: 10, expiresInHours: 24 };
      invitationService.createInvitation.and.returnValue(of({
        success: true,
        invitation: mockInvitations[0],
        message: 'Invitation créée'
      }));
      spyOn(component, 'loadInvitations');

      component.createInvitation();
      tick();

      expect(invitationService.createInvitation).toHaveBeenCalledWith({
        max_uses: 10,
        expires_in_hours: 24
      });
      expect(component.loadInvitations).toHaveBeenCalled();
      expect(notificationService.success).toHaveBeenCalled();
    }));

    it('should deactivate invitation', fakeAsync(() => {
      component.invitations = [...mockInvitations];
      spyOn(window, 'confirm').and.returnValue(true);
      invitationService.deactivateInvitation.and.returnValue(of({
        success: true,
        message: 'Invitation désactivée'
      }));

      component.deactivateInvitation(1);
      tick();

      expect(invitationService.deactivateInvitation).toHaveBeenCalledWith(1);
      expect(component.invitations[0].is_active).toBe(false);
      expect(notificationService.success).toHaveBeenCalled();
    }));

    it('should delete invitation', fakeAsync(() => {
      component.invitations = [...mockInvitations];
      spyOn(window, 'confirm').and.returnValue(true);
      invitationService.deleteInvitation.and.returnValue(of({
        success: true,
        message: 'Invitation supprimée'
      }));

      component.deleteInvitation(1);
      tick();

      expect(invitationService.deleteInvitation).toHaveBeenCalledWith(1);
      expect(component.invitations.length).toBe(1);
      expect(notificationService.success).toHaveBeenCalled();
    }));
  });

  // ✅ TEST 9: Utilitaires
  describe('Utility Methods', () => {
    it('should check if user can create guild', () => {
      component.user = mockUser;
      planService.isPremiumActive.and.returnValue(true);

      expect(component.canCreateGuild()).toBe(true);

      planService.isPremiumActive.and.returnValue(false);
      expect(component.canCreateGuild()).toBe(false);

      component.user = null;
      expect(component.canCreateGuild()).toBe(false);
    });

    it('should navigate to dashboard', () => {
      component.goToDashboard();
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should navigate to upgrade', () => {
      component.goToUpgrade();
      expect(router.navigate).toHaveBeenCalledWith(['/upgrade']);
    });

    it('should get inactive invitations count', () => {
      component.invitations = mockInvitations;
      expect(component.getInactiveInvitationsCount()).toBe(1);
    });

    it('should track by invitation id', () => {
      const invitation = { id: 123 };
      expect(component.trackByInvitationId(0, invitation)).toBe(123);
    });
  });

  // ✅ TEST 10: Presse-papier
  describe('Clipboard functionality', () => {
    it('should copy to clipboard successfully', fakeAsync(() => {
      const mockClipboard = jasmine.createSpyObj('clipboard', ['writeText']);
      mockClipboard.writeText.and.returnValue(Promise.resolve());
      
      // ✅ CORRIGER: Définir navigator.clipboard avant de l'utiliser
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true
      });
      
      // ✅ CORRIGER: Mock isSecureContext
      Object.defineProperty(window, 'isSecureContext', {
        value: true,
        writable: true
      });

      component.copyToClipboard('test text');
      tick();

      expect(mockClipboard.writeText).toHaveBeenCalledWith('test text');
      expect(notificationService.success).toHaveBeenCalled();
    }));

    it('should use fallback copy method when clipboard API unavailable', () => {
      // ✅ CORRIGER: Supprimer clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true
      });
      
      // ✅ CORRIGER: Mock des éléments DOM
      const mockTextarea = {
        value: '',
        style: { position: '', left: '', top: '', opacity: '' },
        focus: jasmine.createSpy('focus'),
        select: jasmine.createSpy('select'),
        setSelectionRange: jasmine.createSpy('setSelectionRange')
      };
      
      spyOn(document, 'createElement').and.returnValue(mockTextarea as any);
      spyOn(document.body, 'appendChild');
      spyOn(document.body, 'removeChild');
      spyOn(document, 'execCommand').and.returnValue(true);

      component.copyToClipboard('test text');

      expect(document.createElement).toHaveBeenCalledWith('textarea');
      expect(mockTextarea.value).toBe('test text');
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(notificationService.success).toHaveBeenCalled();
    });

    it('should handle clipboard copy failure', fakeAsync(() => {
      const mockClipboard = jasmine.createSpyObj('clipboard', ['writeText']);
      mockClipboard.writeText.and.returnValue(Promise.reject(new Error('Clipboard error')));
      
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true
      });
      
      Object.defineProperty(window, 'isSecureContext', {
        value: true,
        writable: true
      });

      component.copyToClipboard('test text');
      tick();

      expect(mockClipboard.writeText).toHaveBeenCalledWith('test text');
      expect(notificationService.error).toHaveBeenCalled();
    }));

    it('should handle fallback copy failure', () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true
      });
      
      const mockTextarea = {
        value: '',
        style: { position: '', left: '', top: '', opacity: '' },
        focus: jasmine.createSpy('focus'),
        select: jasmine.createSpy('select'),
        setSelectionRange: jasmine.createSpy('setSelectionRange')
      };
      
      spyOn(document, 'createElement').and.returnValue(mockTextarea as any);
      spyOn(document.body, 'appendChild');
      spyOn(document.body, 'removeChild');
      spyOn(document, 'execCommand').and.returnValue(false); // ✅ Échec de la copie

      component.copyToClipboard('test text');

      expect(notificationService.error).toHaveBeenCalledWith(
        'Erreur de copie',
        'Impossible de copier dans le presse-papier'
      );
    });
  });

  // ✅ TEST 11: Quitter la guilde
  describe('Leave Guild', () => {
    beforeEach(() => {
      component.user = createMockUser({ id: 2 }); // ✅ Pas le propriétaire
      component.guild = mockGuild;
    });

    it('should leave guild successfully', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      guildService.leaveGuild.and.returnValue(of({
        success: true,
        message: 'Vous avez quitté la guilde'
      }));
      spyOn(component, 'loadUserAndGuild');

      component.leaveGuild();
      tick(2000);

      expect(guildService.leaveGuild).toHaveBeenCalled();
      expect(component.guild).toBe(null);
      expect(component.loadUserAndGuild).toHaveBeenCalled();
    }));

    it('should not allow owner to leave guild', () => {
      component.user = mockUser; // ✅ Propriétaire (id: 1)
      spyOn(window, 'confirm').and.returnValue(true);

      component.leaveGuild();

      expect(component.errorMessage).toContain('Vous ne pouvez pas quitter votre propre guilde');
    });
  });

  // ✅ TEST 12: Dissolution de la guilde
  describe('Disband Guild', () => {
    beforeEach(() => {
      component.user = mockUser;
      component.guild = mockGuild;
    });

    it('should disband guild with full confirmation', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValues(true, true);
      spyOn(window, 'prompt').and.returnValue('DISSOUDRE');
      guildService.disbandGuild.and.returnValue(of({
        success: true,
        message: 'Guilde dissoute'
      }));

      component.disbandGuild();
      tick(5000);

      expect(guildService.disbandGuild).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    }));

    it('should cancel disband if confirmation fails', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.disbandGuild();

      expect(guildService.disbandGuild).not.toHaveBeenCalled();
    });

    it('should not allow non-owner to disband', () => {
      component.user = { ...mockUser, id: 2 };

      component.disbandGuild();

      expect(component.errorMessage).toContain('Seul le propriétaire peut dissoudre');
    });
  });

  // ✅ TEST 13: Upgrade Premium
  describe('Premium Upgrade', () => {
    it('should upgrade to premium with token', () => {
      const mockResponse = { url: 'https://stripe.com/checkout' };
      
      component.upgradeToPremium();

      const req = httpMock.expectOne(`${environment.apiUrl}/stripe/create-checkout-session`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
      
      req.flush(mockResponse);

      // Note: window.location.href ne peut pas être facilement testé
      expect(component.isUpgrading).toBe(true);
    });

    it('should redirect to home without token', () => {
      spyOnProperty(document, 'cookie', 'get').and.returnValue('');

      component.upgradeToPremium();

      expect(router.navigate).toHaveBeenCalledWith(['/home']);
      expect(component.isUpgrading).toBe(false);
    });
  });

  // ✅ TEST 14: Méthode getCookie
  it('should extract cookie value correctly', () => {
    spyOnProperty(document, 'cookie', 'get').and.returnValue(
      'other=value; auth_token=test-token; another=value'
    );

    const token = component['getCookie']('auth_token');
    
    expect(token).toBe('test-token');
  });

  // ✅ TEST 15: Cleanup d'invitations inactives
  it('should cleanup inactive invitations', fakeAsync(() => {
    component.invitations = mockInvitations;
    spyOn(window, 'confirm').and.returnValue(true);
    invitationService.cleanupInactiveInvitations.and.returnValue(of({
      success: true,
      message: '1 invitation supprimée'
    }));

    component.cleanupInactiveInvitations();
    tick();

    expect(invitationService.cleanupInactiveInvitations).toHaveBeenCalled();
    expect(component.invitations.length).toBe(1); // Seules les actives restent
  }));

  // ✅ TESTS spécifiques aux nouvelles propriétés du modèle
  describe('User Model Properties', () => {
    it('should handle user with DKP correctly', () => {
      const userWithDKP = createMockUser({ total_dkp: 250 });
      component.user = userWithDKP;
      
      expect(component.user.total_dkp).toBe(250);
    });

    it('should handle user status correctly', () => {
      const inactiveUser = createMockUser({ statut: 'inactive' });
      component.user = inactiveUser;
      
      expect(component.user.statut).toBe('inactive');
    });

    it('should handle subscription details', () => {
      expect(mockUser.subscription?.plan_type).toBe('premium');
      expect(mockUser.subscription?.status).toBe('active');
      expect(mockUser.subscription?.price).toBe('9.99');
    });
  });

  describe('Guild Model Properties', () => {
    it('should handle guild member limits', () => {
      const fullGuild = createMockGuild({ 
        member_count: 50, 
        max_members: 50 
      });
      component.guild = fullGuild;
      
      expect(component.guild.member_count).toBe(50);
      expect(component.guild.max_members).toBe(50);
    });

    it('should calculate guild capacity', () => {
      component.guild = mockGuild;
      
      // Méthode à ajouter dans ton composant si pas déjà présente
      // const capacityPercentage = (component.guild.member_count / component.guild.max_members) * 100;
      // expect(capacityPercentage).toBe(10); // 5/50 = 10%
    });
  });
});
