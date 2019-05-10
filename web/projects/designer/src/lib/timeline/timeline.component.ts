import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { TimelineService } from '../services/timeline.service';
import { BsModalService } from 'ngx-bootstrap';
import { TimelineGridComponent } from './timeline-grid/timeline-grid.component';
import { CompositionSettingsComponent } from './composition-settings/composition-settings.component';
import { Composition } from '../models/composition';
import { UuidService } from '../services/uuid.service';
import { ProjectService } from '../services/project.service';

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
    private modalService: BsModalService,
    private uuidService: UuidService,
    public projectService: ProjectService
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

  @HostListener('window:resize')
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

  private openCompositionSettings(compositionIndex?: number, newComposition?: Composition) {
    let editComposition: Composition = newComposition || JSON.parse(JSON.stringify(this.projectService.project.compositions[compositionIndex]));

    let bsModalRef = this.modalService.show(CompositionSettingsComponent, { keyboard: false, ignoreBackdropClick: true, class: '', initialState: { composition: editComposition } });

    (<CompositionSettingsComponent>bsModalRef.content).onClose.subscribe(result => {
      if (result === 1) {
        // OK has been pressed -> save
        if (newComposition) {
          this.projectService.project.compositions.push(editComposition);
          this.timelineService.selectedCompositionIndex = this.projectService.project.compositions.length - 1;

          // create the composition, if externally necessary
          if (this.timelineService.externalCompositionsAvailable) {
            // TODO check, if this composition already exists externally and create it, if not
          }
        } else {
          this.projectService.project.compositions[compositionIndex] = editComposition;
        }

        this.timelineService.selectedComposition = editComposition;
      }
    });
  }

  compositionSettings() {
    if (this.timelineService.selectedCompositionIndex) {
      this.openCompositionSettings(this.timelineService.selectedCompositionIndex);
    }
  }

  addComposition() {
    // create a new composition
    let composition = new Composition();
    composition.uuid = this.uuidService.getUuid();
    composition.name = 'New Composition';

    this.openCompositionSettings(undefined, composition);
  }

  selectComposition(index: number) {
    if (index > 0) {
      this.timelineService.selectedComposition = this.projectService.project.compositions[index];
      this.timelineService.selectedCompositionIndex = index;
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == ' ') {
      if (this.timelineService.playState == 'paused') {
        this.play();
      } else {
        this.pause();
      }

      // prevent checkboxes being toggled, if in focus e.g.
      event.stopPropagation();
      event.preventDefault();
    }
  }

}