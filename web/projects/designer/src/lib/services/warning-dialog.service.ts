import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Injectable } from '@angular/core';
import { WarningDialogComponent } from '../warning-dialog/warning-dialog.component';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class WarningDialogService {

  constructor(
    private modalService: BsModalService,
    private translateService: TranslateService
  ) { }

  // Show a warning dialog and return true, when the user clicked OK
  show(message: string): Observable<boolean> {
    return this.translateService.get(message).pipe(map(result => {
      return result;
    }), mergeMap(result => {
      const fileDialog = this.modalService.show(WarningDialogComponent, { keyboard: false, ignoreBackdropClick: true });
      (<WarningDialogComponent>fileDialog.content).message = result;

      return (<WarningDialogComponent>fileDialog.content).onClose.pipe(map(warningResult => {
        if (warningResult === 1) {
          return true;
        }

        return false;
      }));
    }));
  }

}
