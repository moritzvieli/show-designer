import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { TimelineService } from 'src/app/services/timeline.service';

@Component({
  selector: 'app-timeline-grid',
  templateUrl: './timeline-grid.component.html',
  styleUrls: ['./timeline-grid.component.css']
})
export class TimelineGridComponent implements OnInit {

  constructor(
    public bsModalRef: BsModalRef,
    public timelineService: TimelineService
  ) { }

  ngOnInit() {
  }

  ok() {
    // TODO apply the grid settings
    this.bsModalRef.hide()
  }

  cancel() {
    // TODO apply the grid settings
    this.bsModalRef.hide()
  }

  updateGrid() {
    this.timelineService.updateGrid();
  }

}
