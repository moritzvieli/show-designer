import { Component, ViewChild, AfterViewInit, ViewEncapsulation, Input, HostListener } from '@angular/core';
import { PreviewComponent } from './preview/preview.component';
import { TimelineComponent } from './timeline/timeline.component';
import { TranslateService } from '@ngx-translate/core';
import { ProjectService } from './services/project.service';
import Split from 'split.js';
import { TimelineService } from './services/timeline.service';
import { map, catchError, finalize } from 'rxjs/operators';
import { ConfigService } from './services/config.service';
import { FixturePoolService } from './services/fixture-pool.service';

@Component({
  selector: 'lib-designer',
  templateUrl: './designer.component.html',
  styleUrls: ['./designer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DesignerComponent implements AfterViewInit {

  private _menuHeightPx: number = 0;

  private fixturePoolOpened: boolean = false;

  @Input()
  set menuHeightPx(value: number) {
    this._menuHeightPx = value;
    this.calcTotalMenuHeight();
  }

  @Input()
  set externalCompositionsAvailable(value: boolean) {
    this.timelineService.externalCompositionsAvailable = value;
  }

  @Input()
  set restUrl(value: string) {
    this.configService.restUrl = value;
  }

  @Input()
  set enableMediaLibrary(value: boolean) {
    this.configService.enableMediaLibrary = value;
  }

  // the size of the menu used in the designer
  private designerMenuSizePx = 20;

  private splitGutterSizePx = 13;

  public totalMenuHeightPx: number = 0;

  currentTab: string = 'properties';

  @ViewChild(PreviewComponent)
  previewComponent: PreviewComponent;

  @ViewChild(TimelineComponent)
  timelineComponent: TimelineComponent;

  constructor(
    private translateService: TranslateService,
    private projectService: ProjectService,
    private timelineService: TimelineService,
    private configService: ConfigService,
    private fixturePoolService: FixturePoolService
  ) {

    this.translateService.use('en');
    this.calcTotalMenuHeight();
  }

  private calcTotalMenuHeight() {
    this.totalMenuHeightPx = this.designerMenuSizePx + this.splitGutterSizePx + this._menuHeightPx;
  }

  private onResize() {
    if (this.previewComponent) {
      this.previewComponent.onResize();
    }

    if (this.timelineComponent) {
      this.timelineComponent.onResize();
    }
  }

  ngAfterViewInit(): void {
    // Set up the splitter
    setTimeout(() => {
      Split(['#row1', '#row2', '#row3'], {
        sizes: [42, 38, 20],
        direction: 'vertical',
        cursor: 'row-resize',
        snapOffset: 0,
        gutterSize: this.splitGutterSizePx,
        onDrag: this.onResize.bind(this)
      });
  
      Split(['#scenes', '#presets', '#preview'], {
        sizes: [15, 15, 70],
        snapOffset: 0,
        gutterSize: this.splitGutterSizePx,
        onDrag: this.onResize.bind(this)
      });
  
      Split(['#capabilities', '#fixtures', '#masterDimmer'], {
        sizes: [76, 16, 8],
        snapOffset: 0,
        gutterSize: this.splitGutterSizePx,
        onDrag: this.onResize.bind(this),
        minSize: 50
      });
  
      this.onResize();
    });
  }

  openTab(tab: string) {
    if (tab == 'properties' && this.currentTab != 'properties') {
      // Nothing to do currently
    }

    this.currentTab = tab;
  }

  openFixturePool() {
    this.fixturePoolService.open();
  }

  projectOpen() {
    // TODO
  }

  projectClose() {
    // TODO
  }

  projectSave() {
    // TODO
    //this.savingComposition = true;

    this.projectService.save(this.projectService.project).pipe(map(() => {
      // this.loadCompositions();
      // this.copyInitialComposition();

      // this.compositionService.compositionsChanged.next();

      // this.translateService.get(['editor.toast-composition-save-success', 'editor.toast-save-success-title']).subscribe(result => {
      //   this.toastrService.success(result['editor.toast-composition-save-success'], result['editor.toast-save-success-title']);
      // });
    }),
      catchError((err) => {
        //return this.toastGeneralErrorService.show(err);
        return undefined;
      }),
      finalize(() => {
        //this.savingComposition = false;
      }))
      .subscribe();
  }

  projectExport() {
    let json = JSON.stringify(this.projectService.project, null, 2);
    let element = document.createElement('a');
    element.setAttribute('href', "data:text/json;charset=UTF-8," + encodeURIComponent(json));
    element.setAttribute('download', this.projectService.project.name + '.rsd');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == 'p' && !this.fixturePoolOpened) {
      this.openFixturePool();

      // prevent checkboxes being toggled, if in focus e.g.
      event.stopPropagation();
      event.preventDefault();
    }
  }

}
