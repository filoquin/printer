import { TestBed } from '@angular/core/testing';

import { PriceChangesService } from './price-changes.service';

describe('PriceChangesService', () => {
  let service: PriceChangesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PriceChangesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
