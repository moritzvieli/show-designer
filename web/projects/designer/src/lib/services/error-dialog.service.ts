import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class ErrorDialogService {
  constructor(private modalService: BsModalService, private translateService: TranslateService) {}

  // Show a warning dialog and return true, when the user clicked OK
  show(message: string, details?: string): Observable<boolean> {
    return this.translateService.get(message).pipe(
      map((result) => {
        return result;
      }),
      mergeMap((result) => {
        const fileDialog = this.modalService.show(ErrorDialogComponent, { keyboard: true, ignoreBackdropClick: false });
        (fileDialog.content as ErrorDialogComponent).message = result;
        (fileDialog.content as ErrorDialogComponent).details = details;

        return (fileDialog.content as ErrorDialogComponent).onClose.pipe(
          map((errorResult) => {
            if (errorResult === 1) {
              return true;
            }

            return false;
          })
        );
      })
    );
  }
}
