import { inject, TestBed } from '@angular/core/testing';

import { FixturePoolService } from './fixture-pool.service';

describe('FixturePoolService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FixturePoolService],
    });
  });

  it('should be created', inject([FixturePoolService], (service: FixturePoolService) => {
    expect(service).toBeTruthy();
  }));
});
