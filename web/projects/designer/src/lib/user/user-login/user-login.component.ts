import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { UserService } from '../../services/user.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'lib-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent implements OnInit {

  error: string = '';
  loggingIn: boolean = false;

  email: string = '';
  password: string = '';

  // emits, when logged in
  subject: Subject<void>;

  constructor(
    private bsModalRef: BsModalRef,
    private userService: UserService
  ) { }

  ngOnInit() {
  }

  cancel() {
    this.bsModalRef.hide()
  }

  login() {
    this.loggingIn = true;
    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'fill-all-fields';
      this.loggingIn = false;
      return;
    }

    this.userService.login(this.email, this.password).subscribe(() => {
      this.bsModalRef.hide();
      if (this.subject) {
        this.subject.next();
      }
    }, (response) => {
      if (response.error && response.error.error) {
        this.error = response.error.error;
      } else {
        this.error = 'internal';
      }
      this.loggingIn = false;
    });
  }

}
