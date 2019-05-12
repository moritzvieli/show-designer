import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { TimelineService } from '../../services/timeline.service';

@Component({
  selector: 'app-timeline-grid',
  templateUrl: './timeline-grid.component.html',
  styleUrls: ['./timeline-grid.component.css']
})
export class TimelineGridComponent implements OnInit {

  public gridType: string;
  public beatsPerMinute: number;
  public timeSignatureUpper: number;
  public timeSignatureLower: number;
  public snapToGrid: boolean;
  public gridOffsetMillis: number;

  constructor(
    public bsModalRef: BsModalRef,
    public timelineService: TimelineService,
  ) {
    this.gridType = timelineService.selectedComposition.gridType;
    this.beatsPerMinute = timelineService.selectedComposition.beatsPerMinute;
    this.timeSignatureUpper = timelineService.selectedComposition.timeSignatureUpper;
    this.timeSignatureLower = timelineService.selectedComposition.timeSignatureLower;
    this.snapToGrid = timelineService.selectedComposition.snapToGrid;
    this.gridOffsetMillis = timelineService.selectedComposition.gridOffsetMillis;
  }

  ngOnInit() {
  }

  ok() {
    this.timelineService.selectedComposition.gridType = this.gridType;
    this.timelineService.selectedComposition.beatsPerMinute = this.beatsPerMinute;
    this.timelineService.selectedComposition.timeSignatureUpper = this.timeSignatureUpper;
    this.timelineService.selectedComposition.timeSignatureLower = this.timeSignatureLower;
    this.timelineService.selectedComposition.snapToGrid = this.snapToGrid;
    this.timelineService.selectedComposition.gridOffsetMillis = this.gridOffsetMillis;

    this.timelineService.updateGrid();
    this.bsModalRef.hide();
  }

  cancel() {
    this.bsModalRef.hide();
  }

}
