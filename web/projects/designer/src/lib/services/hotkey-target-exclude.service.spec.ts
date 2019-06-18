import { TestBed, inject } from '@angular/core/testing';

import { HotkeyTargetExcludeService } from './hotkey-target-exclude.service';

describe('HotkeyTargetExcludeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HotkeyTargetExcludeService]
    });
  });

  it('should be created', inject([HotkeyTargetExcludeService], (service: HotkeyTargetExcludeService) => {
    expect(service).toBeTruthy();
  }));
});
