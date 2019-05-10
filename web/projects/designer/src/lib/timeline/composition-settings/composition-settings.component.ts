import { Component, OnInit } from '@angular/core';
import { Composition } from '../../models/composition';
import { BsModalRef } from 'ngx-bootstrap';
import { TimelineService } from '../../services/timeline.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-composition-settings',
  templateUrl: './composition-settings.component.html',
  styleUrls: ['./composition-settings.component.css']
})
export class CompositionSettingsComponent implements OnInit {

  composition: Composition;
  existingCompositionNames: string[] = [];

  public onClose: Subject<number> = new Subject();

  constructor(
    public bsModalRef: BsModalRef,
    private timelineService: TimelineService
  ) { }

  ngOnInit() {
    if (this.timelineService.externalCompositionsAvailable) {
      this.timelineService.getExternalCompositionNames().subscribe(compositionNames => {
        this.existingCompositionNames = compositionNames;
      });
    }
  }
  
  ok() {
    this.onClose.next(1);
    this.bsModalRef.hide()
  }

  cancel() {
    this.onClose.next(2);
    this.bsModalRef.hide()
  }

}
