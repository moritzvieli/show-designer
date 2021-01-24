import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { UserService } from './user.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { UserRegisterComponent } from '../user/user-register/user-register.component';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class UserEnsureLoginService {

  constructor(
    private userService: UserService,
    private modalService: BsModalService,
    private configService: ConfigService
  ) { }

  // show the login form and log a user in, if required
  login(): Observable<void> {
    if (this.userService.isLoggedIn()) {
      return of(null);
    }

    if (!this.configService.loginAvailable) {
      return of(null);
    }

    const subject = new Subject<void>();
    this.modalService.show(UserRegisterComponent, { keyboard: true, ignoreBackdropClick: false, initialState: { subject: subject } });
    return subject;
  }

}
