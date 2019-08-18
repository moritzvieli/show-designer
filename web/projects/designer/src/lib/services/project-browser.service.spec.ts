import { TestBed } from '@angular/core/testing';

import { ProjectBrowserService } from './project-browser.service';

describe('ProjectBrowserService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProjectBrowserService = TestBed.get(ProjectBrowserService);
    expect(service).toBeTruthy();
  });
});
