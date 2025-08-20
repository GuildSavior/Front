import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { NotificationsComponent } from './notifications.component';
import { NotificationService, Notification } from '../../../services/notification/notification.service';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
  let notificationService: NotificationService;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NotificationsComponent,
        BrowserAnimationsModule // ✅ Nécessaire pour les animations
      ],
      providers: [NotificationService]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(NotificationService);
    compiled = fixture.nativeElement;
  });

  // ✅ TEST 1: Création du composant
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ✅ TEST 2: Initialisation
  it('should initialize with notifications observable', () => {
    expect(component.notifications$).toBeDefined();
  });

  // ✅ TEST 3: Affichage vide initial
  it('should display no notifications initially', () => {
    fixture.detectChanges();
    const notificationElements = compiled.querySelectorAll('.notification');
    expect(notificationElements.length).toBe(0);
  });

  // ✅ TEST 4: Affichage d'une notification
  it('should display notification when service adds one', () => {
    notificationService.success('Test Title', 'Test Message');
    fixture.detectChanges();

    const notificationElements = compiled.querySelectorAll('.notification');
    expect(notificationElements.length).toBe(1);

    const notification = notificationElements[0];
    expect(notification.textContent).toContain('Test Title');
    expect(notification.textContent).toContain('Test Message');
  });

  // ✅ TEST 5: Types de notifications et classes CSS
  it('should apply correct CSS classes for different notification types', () => {
    notificationService.success('Success', 'Success Message');
    notificationService.error('Error', 'Error Message');
    notificationService.warning('Warning', 'Warning Message');
    notificationService.info('Info', 'Info Message');
    
    fixture.detectChanges();

    const notifications = compiled.querySelectorAll('.notification');
    expect(notifications[0]).toHaveClass('notification-success');
    expect(notifications[1]).toHaveClass('notification-error');
    expect(notifications[2]).toHaveClass('notification-warning');
    expect(notifications[3]).toHaveClass('notification-info');
  });

  // ✅ TEST 6: Icônes correctes
  it('should display correct icons for notification types', () => {
    expect(component.getIcon('success')).toBe('fas fa-check-circle');
    expect(component.getIcon('error')).toBe('fas fa-exclamation-circle');
    expect(component.getIcon('warning')).toBe('fas fa-exclamation-triangle');
    expect(component.getIcon('info')).toBe('fas fa-info-circle');
    expect(component.getIcon('unknown')).toBe('fas fa-bell');
  });

  // ✅ TEST 7: Affichage des icônes dans le DOM
  it('should display correct icon in DOM', () => {
    notificationService.success('Test', 'Message');
    fixture.detectChanges();

    const iconElement = compiled.querySelector('.notification-icon i');
    expect(iconElement).toHaveClass('fas');
    expect(iconElement).toHaveClass('fa-check-circle');
  });

  // ✅ TEST 8: Bouton de fermeture
  it('should display close button', () => {
    notificationService.info('Test', 'Message');
    fixture.detectChanges();

    const closeButton = compiled.querySelector('.notification-close');
    expect(closeButton).toBeTruthy();
    
    const closeIcon = closeButton?.querySelector('i');
    expect(closeIcon).toHaveClass('fas');
    expect(closeIcon).toHaveClass('fa-times');
  });

  // ✅ TEST 9: Fermeture d'une notification
  it('should close notification when close button is clicked', () => {
    notificationService.info('Test', 'Message');
    fixture.detectChanges();

    // Vérifier qu'il y a une notification
    let notifications = compiled.querySelectorAll('.notification');
    expect(notifications.length).toBe(1);

    // Cliquer sur le bouton fermer
    const closeButton = compiled.querySelector('.notification-close') as HTMLElement;
    closeButton.click();
    fixture.detectChanges();

    // Vérifier que la notification a été supprimée
    notifications = compiled.querySelectorAll('.notification');
    expect(notifications.length).toBe(0);
  });

  // ✅ TEST 10: Méthode close
  it('should call notificationService.remove when close is called', () => {
    spyOn(notificationService, 'remove');
    
    component.close('test-id');
    
    expect(notificationService.remove).toHaveBeenCalledWith('test-id');
  });

  // ✅ TEST 11: TrackBy function
  it('should return notification id for trackBy function', () => {
    const mockNotification: Notification = {
      id: 'test-id-123',
      type: 'info',
      title: 'Test',
      message: 'Message',
      duration: 5000
    };

    const result = component.trackByFn(0, mockNotification);
    
    expect(result).toBe('test-id-123');
  });

  // ✅ TEST 12: Plusieurs notifications
  it('should display multiple notifications', () => {
    notificationService.success('First', 'Message 1');
    notificationService.warning('Second', 'Message 2');
    notificationService.error('Third', 'Message 3');
    
    fixture.detectChanges();

    const notifications = compiled.querySelectorAll('.notification');
    expect(notifications.length).toBe(3);

    // Vérifier le contenu de chaque notification
    expect(notifications[0].textContent).toContain('First');
    expect(notifications[1].textContent).toContain('Second');
    expect(notifications[2].textContent).toContain('Third');
  });

  // ✅ TEST 13: Structure DOM
  it('should have correct DOM structure', () => {
    notificationService.info('Test Title', 'Test Message');
    fixture.detectChanges();

    const container = compiled.querySelector('.notifications-container');
    expect(container).toBeTruthy();

    const notification = container?.querySelector('.notification');
    expect(notification).toBeTruthy();

    const icon = notification?.querySelector('.notification-icon');
    const content = notification?.querySelector('.notification-content');
    const title = content?.querySelector('.notification-title');
    const message = content?.querySelector('.notification-message');
    const closeBtn = notification?.querySelector('.notification-close');

    expect(icon).toBeTruthy();
    expect(content).toBeTruthy();
    expect(title).toBeTruthy();
    expect(message).toBeTruthy();
    expect(closeBtn).toBeTruthy();

    expect(title?.textContent).toBe('Test Title');
    expect(message?.textContent).toBe('Test Message');
  });

  // ✅ TEST 14: Gestion des types invalides d'icônes
  it('should handle invalid icon type gracefully', () => {
    // @ts-ignore - Test d'un type invalide
    const icon = component.getIcon('invalid-type');
    expect(icon).toBe('fas fa-bell');
  });

  // ✅ TEST 15: Réactivité aux changements du service
  it('should react to service notification changes', () => {
    fixture.detectChanges();
    
    // Aucune notification initialement
    let notifications = compiled.querySelectorAll('.notification');
    expect(notifications.length).toBe(0);

    // Ajouter une notification
    notificationService.success('Test', 'Message');
    fixture.detectChanges();
    
    notifications = compiled.querySelectorAll('.notification');
    expect(notifications.length).toBe(1);

    // Ajouter une autre notification
    notificationService.error('Error', 'Error Message');
    fixture.detectChanges();
    
    notifications = compiled.querySelectorAll('.notification');
    expect(notifications.length).toBe(2);
  });
});
