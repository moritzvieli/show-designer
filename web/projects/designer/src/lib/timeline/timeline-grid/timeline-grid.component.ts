import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { TimelineService } from '../../services/timeline.service';

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

  updateGrid() {
    this.timelineService.updateGrid();
  }

}
