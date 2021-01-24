import { Injectable } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ErrorDialogService {

  constructor(
    private modalService: BsModalService,
    private translateService: TranslateService
  ) { }

  // Show a warning dialog and return true, when the user clicked OK
  show(message: string, details?: string): Observable<boolean> {
    return this.translateService.get(message).pipe(map(result => {
      return result;
    }), mergeMap(result => {
      const fileDialog = this.modalService.show(ErrorDialogComponent, { keyboard: true, ignoreBackdropClick: false });
      (<ErrorDialogComponent>fileDialog.content).message = result;
      (<ErrorDialogComponent>fileDialog.content).details = details;

      return (<ErrorDialogComponent>fileDialog.content).onClose.pipe(map(errorResult => {
        if (errorResult === 1) {
          return true;
        }

        return false;
      }));
    }));
  }

}
