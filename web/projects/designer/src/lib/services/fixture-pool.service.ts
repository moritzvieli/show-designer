import { Injectable } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FixturePoolComponent } from '../fixture-pool/fixture-pool.component';

@Injectable({
  providedIn: 'root'
})
export class FixturePoolService {

  private fixturePoolOpened = false;

  constructor(
    private modalService: BsModalService,
  ) { }

  open() {
    if (this.fixturePoolOpened) {
      return;
    }

    this.fixturePoolOpened = true;
    const bsModalRef = this.modalService.show(FixturePoolComponent, { keyboard: false, ignoreBackdropClick: true, class: 'modal-full' });
    (<FixturePoolComponent>bsModalRef.content).onClose.subscribe(result => {
      this.fixturePoolOpened = false;
    });
  }

}
