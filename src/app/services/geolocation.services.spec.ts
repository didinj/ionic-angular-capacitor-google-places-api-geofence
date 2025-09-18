import { TestBed } from '@angular/core/testing';

import { GeolocationServices } from './geolocation.services';

describe('GeolocationServices', () => {
  let service: GeolocationServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeolocationServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
