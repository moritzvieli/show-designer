import { Component, ViewChild, AfterViewInit, ViewEncapsulation, Input, HostListener } from '@angular/core';
import { PreviewComponent } from './preview/preview.component';
import { TimelineComponent } from './timeline/timeline.component';
import { TranslateService } from '@ngx-translate/core';
import { ProjectService } from './services/project.service';
import Split from 'split.js';
import { TimelineService } from './services/timeline.service';
import { ConfigService } from './services/config.service';
import { FixturePoolService } from './services/fixture-pool.service';
import { HotkeyTargetExcludeService } from './services/hotkey-target-exclude.service';
import { UserRegisterComponent } from './user/user-register/user-register.component';
import { BsModalService } from 'ngx-bootstrap';
import { UserService } from './services/user.service';
import { UserEnsureLoginService } from './services/user-ensure-login.service';
import { ToastrService } from 'ngx-toastr';
import { ProjectBrowserComponent } from './project-browser/project-browser.component';
import { ProjectLoadService } from './services/project-load.service';
import { ProjectImportComponent } from './project-import/project-import.component';
import { ProjectShareComponent } from './project-share/project-share.component';

@Component({
  selector: 'lib-designer',
  templateUrl: './designer.component.html',
  styleUrls: ['./designer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DesignerComponent implements AfterViewInit {

  private _menuHeightPx: number = 0;

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

  @Input()
  set loginAvailable(value: boolean) {
    this.configService.loginAvailable = value;
  }

  @Input()
  set shareAvailable(value: boolean) {
    this.configService.shareAvailable = value;
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
    private fixturePoolService: FixturePoolService,
    private hotkeyTargetExcludeService: HotkeyTargetExcludeService,
    private modalService: BsModalService,
    public userService: UserService,
    private userEnsureLoginService: UserEnsureLoginService,
    private toastrService: ToastrService,
    private projectLoadService: ProjectLoadService
  ) {

    this.translateService.use('en');
    this.calcTotalMenuHeight();

    if (this.userService.isLoggedIn() && this.userService.getAutoLoadProjectId()) {
      this.projectLoadService.load(this.userService.getAutoLoadProjectId()).subscribe(() => {
        // success
      }, (response) => {
        let msg = 'designer.project.open-error';
        let title = 'designer.project.open-error-title';
        let error = response && response.error ? response.error.error : 'unknown';

        this.translateService.get([msg, title]).subscribe(result => {
          this.toastrService.error(result[msg] + ' (' + error + ')', result[title]);
        });
      });
    } else {
      this.projectLoadService.template();
    }
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
        sizes: [74, 18, 8],
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

  projectNew() {
    this.projectLoadService.new();
  }

  projectOpen() {
    this.userEnsureLoginService.login().subscribe(() => {
      this.modalService.show(ProjectBrowserComponent, { keyboard: true, ignoreBackdropClick: false });
    });
  }

  projectSave() {
    this.userEnsureLoginService.login().subscribe(() => {
      this.projectService.save(this.projectService.project).subscribe(() => {
        let msg = 'designer.project.save-success';
        let title = 'designer.project.save-success-title';

        this.translateService.get([msg, title]).subscribe(result => {
          this.toastrService.success(result[msg], result[title]);
        });

        this.userService.setAutoLoadProjectId(this.projectService.project.id);
      }, (response) => {
        let msg = 'designer.project.save-error';
        let title = 'designer.project.save-error-title';
        let error = response && response.error ? response.error.error : 'unknown';

        this.translateService.get([msg, title]).subscribe(result => {
          this.toastrService.error(result[msg] + ' (' + error + ')', result[title]);
        });
      });
    });
  }

  userRegister() {
    this.modalService.show(UserRegisterComponent, { keyboard: true, ignoreBackdropClick: false });
  }

  projectImport() {
    this.modalService.show(ProjectImportComponent, { keyboard: true, ignoreBackdropClick: false });
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

  projectShare() {
    if (!this.projectService.project.shareToken) {
      // a save is required first
      let msg = 'designer.project.share-no-save';
      let title = 'designer.project.share-no-save-title';

      this.translateService.get([msg, title]).subscribe(result => {
        this.toastrService.error(result[msg], result[title]);
      });
      return;
    }

    this.modalService.show(ProjectShareComponent, { keyboard: true, ignoreBackdropClick: false });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: any) {
    if (this.hotkeyTargetExcludeService.exclude(event)) {
      return;
    }

    if (event.key == 'p') {
      this.openFixturePool();

      // prevent checkboxes being toggled, if in focus e.g.
      event.stopPropagation();
      event.preventDefault();
    }
  }

}
