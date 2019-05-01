import { TestBed, inject } from '@angular/core/testing';

import { PresetService } from './preset.service';

describe('PresetService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PresetService]
    });
  });

  it('should be created', inject([PresetService], (service: PresetService) => {
    expect(service).toBeTruthy();
  }));
});
