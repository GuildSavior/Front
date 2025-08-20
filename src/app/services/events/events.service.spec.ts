import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { EventService } from './events.service';
import { environment } from '../../../environments/environment';

describe('EventService', () => {
  let service: EventService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EventService]
    });
    service = TestBed.inject(EventService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get events', () => {
    const mockEvents = [
      {
        id: 1,
        title: 'Test Event',
        description: 'Test Description',
        event_date: '2025-01-01T10:00:00Z',
        location: 'Test Location',
        dkp_reward: 10
      }
    ];

    service.getEvents().subscribe(events => {
      expect(events).toEqual(mockEvents);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/events`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEvents);
  });

  it('should create event', () => {
    const newEvent = {
      title: 'New Event',
      description: 'New Description',
      event_date: '2025-02-01T10:00:00Z',
      location: 'New Location',
      dkp_reward: 15
    };

    const mockResponse = { id: 2, ...newEvent };

    service.createEvent(newEvent).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/events`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newEvent);
    req.flush(mockResponse);
  });
});
