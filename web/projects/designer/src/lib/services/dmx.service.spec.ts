import { inject, TestBed } from '@angular/core/testing';

import { DmxService } from './dmx.service';

describe('DmxService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DmxService],
    });
  });

  it('should be created', inject([DmxService], (service: DmxService) => {
    expect(service).toBeTruthy();
  }));
});
