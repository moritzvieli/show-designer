import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { UserService } from './user.service';
import { BsModalService } from 'ngx-bootstrap';
import { UserRegisterComponent } from '../user/user-register/user-register.component';

@Injectable({
  providedIn: 'root'
})
export class UserEnsureLoginService {

  constructor(
    private userService: UserService,
    private modalService: BsModalService
  ) { }

  // show the login form and log a user in, if required
  login(): Observable<void> {
    if (this.userService.isLoggedIn()) {
      return of(null);
    }

    let subject = new Subject<void>();
    this.modalService.show(UserRegisterComponent, { keyboard: true, ignoreBackdropClick: false, initialState: { subject: subject } });
    return subject;
  }

}
