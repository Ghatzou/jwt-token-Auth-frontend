import { TestBed } from '@angular/core/testing';

import { HttpRoutesService } from './http-routes.service';

describe('HttpRoutesService', () => {
  let service: HttpRoutesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpRoutesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
