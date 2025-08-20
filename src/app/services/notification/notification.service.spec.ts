import { TestBed } from '@angular/core/testing';
import { fakeAsync, tick } from '@angular/core/testing';

import { NotificationService, Notification } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  // ✅ TEST 1: Création du service
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ✅ TEST 2: Observable initial vide
  it('should return empty notifications initially', (done) => {
    service.getNotifications().subscribe(notifications => {
      expect(notifications).toEqual([]);
      done();
    });
  });

  // ✅ TEST 3: Affichage d'une notification
  it('should add notification when show is called', (done) => {
    const testNotification = {
      type: 'success' as const,
      title: 'Test Title',
      message: 'Test Message'
    };

    service.show(testNotification);

    service.getNotifications().subscribe(notifications => {
      expect(notifications.length).toBe(1);
      expect(notifications[0].type).toBe('success');
      expect(notifications[0].title).toBe('Test Title');
      expect(notifications[0].message).toBe('Test Message');
      expect(notifications[0].id).toBeDefined();
      expect(notifications[0].duration).toBe(5000); // durée par défaut
      done();
    });
  });

  // ✅ TEST 4: Notification avec durée personnalisée
  it('should use custom duration when provided', (done) => {
    const testNotification = {
      type: 'warning' as const,
      title: 'Warning',
      message: 'Custom duration',
      duration: 3000
    };

    service.show(testNotification);

    service.getNotifications().subscribe(notifications => {
      expect(notifications[0].duration).toBe(3000);
      done();
    });
  });

  // ✅ TEST 5: Suppression d'une notification
  it('should remove notification by id', (done) => {
    const testNotification = {
      type: 'info' as const,
      title: 'Info',
      message: 'To be removed'
    };

    service.show(testNotification);

    let notificationId: string;
    let callCount = 0;

    service.getNotifications().subscribe(notifications => {
      callCount++;
      
      if (callCount === 1) {
        // Première émission : notification ajoutée
        expect(notifications.length).toBe(1);
        notificationId = notifications[0].id;
        
        // Supprimer la notification
        service.remove(notificationId);
      } else if (callCount === 2) {
        // Deuxième émission : notification supprimée
        expect(notifications.length).toBe(0);
        done();
      }
    });
  });

  // ✅ TEST 6: Suppression automatique après timeout
  it('should auto-remove notification after duration', fakeAsync(() => {
    const testNotification = {
      type: 'error' as const,
      title: 'Error',
      message: 'Auto remove',
      duration: 1000
    };

    service.show(testNotification);

    // Vérifier que la notification est présente
    let notifications: Notification[] = [];
    service.getNotifications().subscribe(n => notifications = n);
    
    expect(notifications.length).toBe(1);

    // Avancer le temps de 1000ms
    tick(1000);

    // Vérifier que la notification a été supprimée
    expect(notifications.length).toBe(0);
  }));

  // ✅ TEST 7: Plusieurs notifications
  it('should handle multiple notifications', (done) => {
    service.show({ type: 'success', title: 'First', message: 'Message 1' });
    service.show({ type: 'warning', title: 'Second', message: 'Message 2' });
    service.show({ type: 'error', title: 'Third', message: 'Message 3' });

    service.getNotifications().subscribe(notifications => {
      expect(notifications.length).toBe(3);
      expect(notifications[0].title).toBe('First');
      expect(notifications[1].title).toBe('Second');
      expect(notifications[2].title).toBe('Third');
      done();
    });
  });

  // ✅ TEST 8: Méthodes raccourcies
  describe('Shorthand methods', () => {
    it('should create success notification', (done) => {
      service.success('Success Title', 'Success Message');

      service.getNotifications().subscribe(notifications => {
        expect(notifications.length).toBe(1);
        expect(notifications[0].type).toBe('success');
        expect(notifications[0].title).toBe('Success Title');
        expect(notifications[0].message).toBe('Success Message');
        done();
      });
    });

    it('should create error notification', (done) => {
      service.error('Error Title', 'Error Message');

      service.getNotifications().subscribe(notifications => {
        expect(notifications[0].type).toBe('error');
        expect(notifications[0].title).toBe('Error Title');
        done();
      });
    });

    it('should create warning notification', (done) => {
      service.warning('Warning Title', 'Warning Message');

      service.getNotifications().subscribe(notifications => {
        expect(notifications[0].type).toBe('warning');
        expect(notifications[0].title).toBe('Warning Title');
        done();
      });
    });

    it('should create info notification', (done) => {
      service.info('Info Title', 'Info Message');

      service.getNotifications().subscribe(notifications => {
        expect(notifications[0].type).toBe('info');
        expect(notifications[0].title).toBe('Info Title');
        done();
      });
    });
  });

  // ✅ TEST 9: Suppression de notification inexistante
  it('should handle removal of non-existent notification', (done) => {
    service.show({ type: 'info', title: 'Test', message: 'Test' });

    service.getNotifications().subscribe(notifications => {
      const initialLength = notifications.length;
      
      // Essayer de supprimer une notification qui n'existe pas
      service.remove('non-existent-id');
      
      // Le nombre de notifications ne doit pas changer
      expect(notifications.length).toBe(initialLength);
      done();
    });
  });

  // ✅ TEST 10: IDs uniques
  it('should generate unique IDs for notifications', (done) => {
    service.show({ type: 'info', title: 'First', message: 'Message 1' });
    service.show({ type: 'info', title: 'Second', message: 'Message 2' });

    service.getNotifications().subscribe(notifications => {
      expect(notifications.length).toBe(2);
      expect(notifications[0].id).not.toBe(notifications[1].id);
      expect(notifications[0].id.length).toBeGreaterThan(0);
      expect(notifications[1].id.length).toBeGreaterThan(0);
      done();
    });
  });
});
