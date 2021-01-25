import { inject, TestBed } from '@angular/core/testing';

import { UserEnsureLoginService } from './user-ensure-login.service';

describe('UserEnsureLoginService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserEnsureLoginService],
    });
  });

  it('should be created', inject([UserEnsureLoginService], (service: UserEnsureLoginService) => {
    expect(service).toBeTruthy();
  }));
});
