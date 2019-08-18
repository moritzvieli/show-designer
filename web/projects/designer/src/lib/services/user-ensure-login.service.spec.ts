import { TestBed } from '@angular/core/testing';

import { UserEnsureLoginService } from './user-ensure-login.service';

describe('UserEnsureLoginService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UserEnsureLoginService = TestBed.get(UserEnsureLoginService);
    expect(service).toBeTruthy();
  });
});
