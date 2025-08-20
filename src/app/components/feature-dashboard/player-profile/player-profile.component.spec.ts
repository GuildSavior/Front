import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { of, throwError } from 'rxjs';

import { PlayerProfileComponent } from './player-profile.component';
import { environment } from '../../../../environments/environment';

describe('PlayerProfileComponent', () => {
  let component: PlayerProfileComponent;
  let fixture: ComponentFixture<PlayerProfileComponent>;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteMock: any;

  // ✅ Mock des données de joueur
  const mockPlayer = {
    id: 1,
    name: 'TestPlayer',
    class: 'dps',
    level: 50,
    dkp: 100,
    events_joined: 5,
    user: {
      id: 1,
      username: 'test_user',
      avatar: 'https://example.com/avatar.jpg',
      images: [
        {
          id: 1,
          title: 'Image 1',
          description: 'Test image 1',
          url: 'https://example.com/image1.jpg',
          created_at: '2025-01-01T10:00:00Z'
        },
        {
          id: 2,
          title: 'Image 2',
          description: 'Test image 2',
          url: 'https://example.com/image2.jpg',
          created_at: '2025-01-02T10:00:00Z'
        }
      ],
      images_count: 2
    }
  };

  beforeEach(async () => {
    // ✅ Spy pour le Router
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    
    // ✅ Mock pour ActivatedRoute
    activatedRouteMock = {
      params: of({ id: '1' }),
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        }
      }
    };

    // ✅ Mock du document.cookie
    spyOnProperty(document, 'cookie', 'get').and.returnValue('auth_token=fake-token');

    await TestBed.configureTestingModule({
      imports: [
        PlayerProfileComponent,
        HttpClientTestingModule
      ],
      providers: [
        { provide: Router, useValue: routerSpyObj },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerProfileComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ✅ TEST 1: Création du composant
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ✅ TEST 2: Initialisation du composant
  it('should initialize with correct default values', () => {
    expect(component.isLoading).toBe(true);
    expect(component.errorMessage).toBe('');
    expect(component.player).toBe(null);
    expect(component.galleryViewMode).toBe('grid');
    expect(component.showImageModal).toBe(false);
    expect(component.selectedImage).toBe(null);
  });

  // ✅ TEST 3: Chargement réussi du profil joueur
  it('should load player profile successfully', fakeAsync(() => {
    fixture.detectChanges(); // Déclenche ngOnInit

    const req = httpMock.expectOne(`${environment.apiUrl}/players/1`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');

    req.flush({ player: mockPlayer });
    tick();

    expect(component.isLoading).toBe(false);
    expect(component.player).toEqual(mockPlayer);
    expect(component.errorMessage).toBe('');
  }));

  // ✅ TEST 4: Gestion des erreurs de chargement
  it('should handle load player profile error', fakeAsync(() => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiUrl}/players/1`);
    req.flush(
      { message: 'Player not found' },
      { status: 404, statusText: 'Not Found' }
    );
    tick();

    expect(component.isLoading).toBe(false);
    expect(component.player).toBe(null);
    expect(component.errorMessage).toBe('Player not found');
  }));

  // ✅ TEST 5: Gestion du token manquant
  it('should handle missing auth token', () => {
    spyOnProperty(document, 'cookie', 'get').and.returnValue('');
    
    fixture.detectChanges();

    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('Token d\'authentification manquant');
    httpMock.expectNone(`${environment.apiUrl}/players/1`);
  });

  // ✅ TEST 6: Gestion d'un ID invalide
  it('should handle invalid player ID', () => {
    activatedRouteMock.params = of({ id: 'invalid' });
    
    fixture.detectChanges();

    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('ID de joueur invalide');
    httpMock.expectNone(`${environment.apiUrl}/players/invalid`);
  });

  // ✅ TEST 7: Affichage des noms de classe
  it('should return correct class display names', () => {
    expect(component.getClassDisplayName('tank')).toBe('🛡️ Tank');
    expect(component.getClassDisplayName('dps')).toBe('⚔️ DPS');
    expect(component.getClassDisplayName('support')).toBe('🩹 Support');
    expect(component.getClassDisplayName('range')).toBe('🏹 Range');
    expect(component.getClassDisplayName('mage')).toBe('🔮 Mage');
    expect(component.getClassDisplayName('unknown')).toBe('unknown');
  });

  // ✅ TEST 8: Couleurs de classe
  it('should return correct class colors', () => {
    expect(component.getClassColor('tank')).toBe('#3b82f6');
    expect(component.getClassColor('dps')).toBe('#ef4444');
    expect(component.getClassColor('support')).toBe('#10b981');
    expect(component.getClassColor('range')).toBe('#f59e0b');
    expect(component.getClassColor('mage')).toBe('#8b5cf6');
    expect(component.getClassColor('unknown')).toBe('#6b7280');
  });

  // ✅ TEST 9: Calcul du score de performance
  it('should calculate performance score correctly', () => {
    component.player = mockPlayer;
    
    const score = component.getPerformanceScore();
    
    // Calcul attendu:
    // Level: (50/55) * 40 ≈ 36.36
    // DKP: min(100/10, 30) = 10
    // Events: min(5*3, 30) = 15
    // Total ≈ 61.36, arrondi à 61
    expect(score).toBeCloseTo(61, 0);
  });

  it('should return 0 performance score when no player', () => {
    component.player = null;
    expect(component.getPerformanceScore()).toBe(0);
  });

  // ✅ TEST 10: Navigation retour
  it('should navigate back to members', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/members']);
  });

  // ✅ TEST 11: Gestion de la galerie d'images
  describe('Gallery functionality', () => {
    beforeEach(() => {
      component.player = mockPlayer;
    });

    it('should open image modal', () => {
      const image = mockPlayer.user.images[0];
      // ✅ CORRIGER: Utiliser spyOnProperty
      const overflowSpy = spyOnProperty(document.body.style, 'overflow', 'set');

      component.openImageModal(image);

      expect(component.selectedImage).toBe(image);
      expect(component.showImageModal).toBe(true);
      expect(overflowSpy).toHaveBeenCalledWith('hidden');
    });

    it('should close image modal', () => {
      component.selectedImage = mockPlayer.user.images[0];
      component.showImageModal = true;
      // ✅ CORRIGER: Utiliser spyOnProperty
      const overflowSpy = spyOnProperty(document.body.style, 'overflow', 'set');

      component.closeImageModal();

      expect(component.selectedImage).toBe(null);
      expect(component.showImageModal).toBe(false);
      expect(overflowSpy).toHaveBeenCalledWith('auto');
    });

    it('should get current image index', () => {
      component.selectedImage = mockPlayer.user.images[1];
      
      const index = component.getCurrentImageIndex();
      
      expect(index).toBe(1);
    });

    it('should navigate to previous image', () => {
      component.selectedImage = mockPlayer.user.images[1];
      
      component.navigateImage('prev');
      
      expect(component.selectedImage).toBe(mockPlayer.user.images[0]);
    });

    it('should navigate to next image', () => {
      component.selectedImage = mockPlayer.user.images[0];
      
      component.navigateImage('next');
      
      expect(component.selectedImage).toBe(mockPlayer.user.images[1]);
    });

    it('should not navigate beyond bounds', () => {
      // Test début de liste
      component.selectedImage = mockPlayer.user.images[0];
      component.navigateImage('prev');
      expect(component.selectedImage).toBe(mockPlayer.user.images[0]);

      // Test fin de liste
      component.selectedImage = mockPlayer.user.images[1];
      component.navigateImage('next');
      expect(component.selectedImage).toBe(mockPlayer.user.images[1]);
    });
  });

  // ✅ TEST 12: Gestion des événements clavier
  describe('Keyboard events', () => {
    beforeEach(() => {
      component.player = mockPlayer;
      component.selectedImage = mockPlayer.user.images[0];
      component.showImageModal = true;
    });

    it('should close modal on Escape key', () => {
      spyOn(component, 'closeImageModal');
      
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      component['onKeyDown'](event);
      
      expect(component.closeImageModal).toHaveBeenCalled();
    });

    it('should navigate on arrow keys', () => {
      spyOn(component, 'navigateImage');
      
      const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      component['onKeyDown'](leftEvent);
      expect(component.navigateImage).toHaveBeenCalledWith('prev');

      const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      component['onKeyDown'](rightEvent);
      expect(component.navigateImage).toHaveBeenCalledWith('next');
    });

    it('should not handle keys when modal is closed', () => {
      component.showImageModal = false;
      spyOn(component, 'closeImageModal');
      
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      component['onKeyDown'](event);
      
      expect(component.closeImageModal).not.toHaveBeenCalled();
    });
  });

  // ✅ TEST 13: Méthode getCookie
  it('should extract cookie value correctly', () => {
    spyOnProperty(document, 'cookie', 'get').and.returnValue(
      'other_cookie=value; auth_token=test-token-123; another=value'
    );

    const token = component['getCookie']('auth_token');
    
    expect(token).toBe('test-token-123');
  });

  it('should return null for non-existent cookie', () => {
    spyOnProperty(document, 'cookie', 'get').and.returnValue('other_cookie=value');

    const token = component['getCookie']('auth_token');
    
    expect(token).toBe(null);
  });

  // ✅ TEST 14: Lifecycle hooks - CORRIGER aussi ici
  it('should clean up on destroy', () => {
    const removeEventListenerSpy = spyOn(document, 'removeEventListener');
    // ✅ CORRIGER: Utiliser spyOnProperty
    const overflowSpy = spyOnProperty(document.body.style, 'overflow', 'set');

    component.ngOnDestroy();

    expect(removeEventListenerSpy).toHaveBeenCalled();
    expect(overflowSpy).toHaveBeenCalledWith('auto');
  });
});
