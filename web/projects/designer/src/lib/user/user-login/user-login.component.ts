import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { UserService } from '../../services/user.service';

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

  constructor(
    private bsModalRef: BsModalRef,
    private modalService: BsModalService,
    private userService: UserService
  ) { }

  ngOnInit() {
  }

  cancel() {
    this.bsModalRef.hide()
  }

  login() {
    this.bsModalRef.hide();
    this.modalService.show(UserLoginComponent, { keyboard: true, ignoreBackdropClick: false });
  }

  register() {
    this.loggingIn = true;
    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'fill-all-fields';
      this.loggingIn = false;
      return;
    }

    this.userService.login(this.email, this.password).subscribe(() => {
      this.bsModalRef.hide();
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
