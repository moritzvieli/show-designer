import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { TimelineService } from '../services/timeline.service';
import { BsModalService } from 'ngx-bootstrap';
import { TimelineGridComponent } from './timeline-grid/timeline-grid.component';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
})
export class TimelineComponent implements OnInit, AfterViewInit {

  @ViewChild('waveWrapper')
  waveWrapper: ElementRef;

  constructor(
    public timelineService: TimelineService,
    private changeDetectorRef: ChangeDetectorRef,
    private modalService: BsModalService
  ) {
    this.timelineService.waveSurferReady.subscribe(() => {
      this.onResize();
    });
    this.timelineService.detectChanges.subscribe(() => {
      this.changeDetectorRef.detectChanges();
    });
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.timelineService.createWaveSurfer();
  }

  @HostListener('window:resize', ['$event'])
  public onResize() {
    if (this.timelineService.waveSurfer) {
      this.timelineService.waveSurfer.setHeight(1);
      this.timelineService.waveSurfer.setHeight(this.waveWrapper.nativeElement.clientHeight);
    }
  }

  play() {
    this.timelineService.playState = 'playing';
    this.timelineService.waveSurfer.play();
  }

  pause() {
    this.timelineService.playState = 'paused';
    this.timelineService.waveSurfer.pause();
  }

  rewind() {
    this.timelineService.playState = 'paused';
    this.pause();
    this.timelineService.waveSurfer.seekTo(0);
  }

  addRegion(waveSurferRegion?: any) {
    this.timelineService.addRegion(waveSurferRegion);
  }

  removeRegion() {
    this.timelineService.removeRegion();
  }

  openGridSettings() {
    let bsModalRef = this.modalService.show(TimelineGridComponent, { keyboard: true, ignoreBackdropClick: false, class: '' });
  }

  removeComposition() {
    // TODO confirm and delete composition
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == ' ') {
      if (this.timelineService.playState == 'paused') {
        this.play();
      } else {
        this.pause();
      }
    }
  }

}
