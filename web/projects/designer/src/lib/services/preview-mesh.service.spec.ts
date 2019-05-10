import { TestBed, inject } from '@angular/core/testing';

import { PreviewMeshService } from './preview-mesh.service';

describe('PreviewMeshService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PreviewMeshService]
    });
  });

  it('should be created', inject([PreviewMeshService], (service: PreviewMeshService) => {
    expect(service).toBeTruthy();
  }));
});
