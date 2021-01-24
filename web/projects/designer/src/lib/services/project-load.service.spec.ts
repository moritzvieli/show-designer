import { TestBed, inject } from '@angular/core/testing';

import { ProjectLoadService } from './project-load.service';

describe('ProjectLoadService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectLoadService]
    });
  });

  it('should be created', inject([ProjectLoadService], (service: ProjectLoadService) => {
    expect(service).toBeTruthy();
  }));
});
