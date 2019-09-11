import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { TimelineService } from '../services/timeline.service';
import { BsModalService } from 'ngx-bootstrap';
import { TimelineGridComponent } from './timeline-grid/timeline-grid.component';
import { CompositionSettingsComponent } from './composition-settings/composition-settings.component';
import { Composition } from '../models/composition';
import { UuidService } from '../services/uuid.service';
import { ProjectService } from '../services/project.service';
import { HotkeyTargetExcludeService } from '../services/hotkey-target-exclude.service';
import { WarningDialogService } from '../services/warning-dialog.service';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
})
export class TimelineComponent implements OnInit, AfterViewInit {

  @ViewChild('waveWrapper')
  waveWrapper: ElementRef;

  @ViewChild('waveElement')
  waveElement: ElementRef;

  private lastHeight: number;
  private lastWidth: number;

  constructor(
    public timelineService: TimelineService,
    private changeDetectorRef: ChangeDetectorRef,
    private modalService: BsModalService,
    private uuidService: UuidService,
    public projectService: ProjectService,
    private hotkeyTargetExcludeService: HotkeyTargetExcludeService,
    private warningDialogService: WarningDialogService,
    private http: HttpClient,
    private configService: ConfigService
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
  }

  @HostListener('window:resize')
  public onResize() {
    if (!this.waveElement) {
      return;
    }

    // Hide wavesurfer to calculate the height, because it will grow infinitely
    // otherwise
    this.waveElement.nativeElement.style.display = 'none';
    let height = this.waveWrapper.nativeElement.clientHeight;
    this.waveElement.nativeElement.style.display = 'block';

    let width = this.waveWrapper.nativeElement.clientWidth;

    if (!this.lastHeight || this.lastHeight != height || !this.lastWidth || this.lastWidth != width) {
      // Set height and redraw
      if (this.timelineService.waveSurfer) {
        this.timelineService.waveSurfer.setHeight(height);
      }

      this.lastHeight = height;
      this.lastWidth = width;
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

  private afterDeleteFile() {
    this.timelineService.deleteSelectedComposition();
  }

  removeComposition() {
    this.warningDialogService.show('designer.timeline.warning-delete-composition').pipe(map(result => {
      if (result) {
        if (this.configService.enableMediaLibrary) {
          // don't delete the file from the library
          this.afterDeleteFile();
        } else {
          // the composition uuid and extension is used as the file name
          this.http.post('file/delete?compositionUuid=' + this.timelineService.selectedComposition.uuid, undefined).pipe(map((response: Response) => {
            this.afterDeleteFile();
          })).subscribe();
        }
      }
    })).subscribe();
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
            // maybe not needed and even confusing?
          }
        } else {
          this.projectService.project.compositions[compositionIndex] = editComposition;
        }

        this.selectComposition(this.timelineService.selectedCompositionIndex);
      }
    });
  }

  compositionSettings() {
    this.openCompositionSettings(this.timelineService.selectedCompositionIndex);
  }

  addComposition() {
    // create a new composition
    let composition = new Composition();
    composition.uuid = this.uuidService.getUuid();
    composition.name = 'New Composition';

    this.openCompositionSettings(undefined, composition);
  }

  selectComposition(index: number) {
    this.timelineService.selectCompositionIndex(index);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.hotkeyTargetExcludeService.exclude(event)) {
      return;
    }

    if (!this.timelineService.selectedComposition) {
      return;
    }

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
