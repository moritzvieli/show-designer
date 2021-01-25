import { inject, TestBed } from '@angular/core/testing';

import { IntroService } from './intro.service';

describe('IntroService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IntroService],
    });
  });

  it('should be created', inject([IntroService], (service: IntroService) => {
    expect(service).toBeTruthy();
  }));
});
