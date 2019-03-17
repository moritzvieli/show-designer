import { TestBed, inject } from '@angular/core/testing';

import { MasterDimmerService } from './master-dimmer.service';

describe('MasterDimmerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MasterDimmerService]
    });
  });

  it('should be created', inject([MasterDimmerService], (service: MasterDimmerService) => {
    expect(service).toBeTruthy();
  }));
});
