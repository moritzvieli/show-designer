import { TestBed } from '@angular/core/testing';

import { ProjectLoadService } from './project-load.service';

describe('ProjectLoadService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProjectLoadService = TestBed.get(ProjectLoadService);
    expect(service).toBeTruthy();
  });
});
