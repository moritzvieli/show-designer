import { Component, OnInit, HostListener } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { UserLoginComponent } from '../user-login/user-login.component';
import { UserService } from '../../services/user.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'lib-user-register',
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css']
})
export class UserRegisterComponent implements OnInit {

  error: string = '';
  registering: boolean = false;

  username: string = '';
  email: string = '';
  password: string = '';
  passwordRepeat: string = '';

  // emits, when logged in
  subject: Subject<void>;

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
    this.modalService.show(UserLoginComponent, { keyboard: true, ignoreBackdropClick: false, initialState: { subject: this.subject } });
  }

  private emailIsValid(email: string): boolean {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  register() {
    this.registering = true;
    this.error = '';

    if (!this.username || !this.email || !this.password || !this.passwordRepeat) {
      this.error = 'fill-all-fields';
      this.registering = false;
      return;
    }

    if (!this.emailIsValid(this.email)) {
      this.error = 'email-valid';
      this.registering = false;
      return;
    }

    if (this.password != this.passwordRepeat) {
      this.error = 'password-mismatch';
      this.registering = false;
      return;
    }

    this.userService.register(this.email, this.username, this.password).subscribe(() => {
      // automatically login after registering
      this.userService.login(this.email, this.password).subscribe(() => {
        this.registering = false;
        this.bsModalRef.hide();
      });
    }, (response) => {
      if (response.error && response.error.error) {
        this.error = response.error.error;
      } else {
        this.error = 'internal';
      }
      this.registering = false;
    });
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleKeyboardEvent(event: any) {
    this.register();
  }

}
