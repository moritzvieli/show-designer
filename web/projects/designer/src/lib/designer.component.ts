import { Component, ViewEncapsulation, OnInit, Input, ViewChild, HostListener, AfterViewInit } from '@angular/core';
import { TimelineService } from './services/timeline.service';
import { ConfigService } from './services/config.service';
import { PreviewComponent } from './preview/preview.component';
import { ProjectShareComponent } from './project-share/project-share.component';
import { ProjectSettingsComponent } from './project-settings/project-settings.component';
import { TranslateService } from '@ngx-translate/core';
import { FixturePoolService } from './services/fixture-pool.service';
import { HotkeyTargetExcludeService } from './services/hotkey-target-exclude.service';
import { BsModalService } from 'ngx-bootstrap';
import { UserService } from './services/user.service';
import { UserEnsureLoginService } from './services/user-ensure-login.service';
import { ToastrService } from 'ngx-toastr';
import { ErrorDialogService } from './services/error-dialog.service';
import { FixtureService } from './services/fixture.service';
import Split from 'split.js';
import { ProjectBrowserComponent } from './project-browser/project-browser.component';
import { UserRegisterComponent } from './user/user-register/user-register.component';
import { map } from 'rxjs/operators';
import { TimelineComponent } from './timeline/timeline.component';
import { ProjectLoadService } from './services/project-load.service';
import { WarningDialogService } from './services/warning-dialog.service';
import { ProjectImportComponent } from './project-import/project-import.component';
import { ProjectService } from './services/project.service';
import { IntroService } from './services/intro.service';

@Component({
  selector: 'lib-designer',
  templateUrl: './designer.component.html',
  styleUrls: ['./designer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DesignerComponent implements OnInit, AfterViewInit {

  @Input()
  set menuHeightPx(value: number) {
    this.configService.menuHeightPx = value;
    this.configService.menuHeightChanged.next();
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

  @Input()
  set languageSwitch(value: boolean) {
    this.configService.languageSwitch = value;
  }

  @Input()
  set autoLoadProject(value: boolean) {
    this.configService.autoLoadProject = value;
  }

  @Input()
  set livePreview(value: boolean) {
    this.configService.livePreview = value;
  }

  @Input()
  set localProfiles(value: boolean) {
    this.configService.localProfiles = value;
  }

  @Input()
  set intro(value: boolean) {
    this.configService.intro = value;
    this.introService.refresh();
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
    public configService: ConfigService,
    private fixturePoolService: FixturePoolService,
    private hotkeyTargetExcludeService: HotkeyTargetExcludeService,
    private modalService: BsModalService,
    public userService: UserService,
    private userEnsureLoginService: UserEnsureLoginService,
    private toastrService: ToastrService,
    private projectLoadService: ProjectLoadService,
    private warningDialogService: WarningDialogService,
    private errorDialogService: ErrorDialogService,
    private fixtureService: FixtureService,
    private timelineService: TimelineService,
    public introService: IntroService
  ) {
    this.configService.menuHeightChanged.subscribe(() => {
      this.calcTotalMenuHeight();
    });
  }

  ngOnInit() {
    if (localStorage.getItem('language')) {
      this.translateService.use(localStorage.getItem('language'));
    } else {
      this.translateService.use('en');
    }

    this.calcTotalMenuHeight();

    let urlParams = new URLSearchParams(window.location.search);
    let projectId = urlParams.get('id');
    let projectName = urlParams.get('name');
    let shareToken = urlParams.get('token');

    if (this.configService.autoLoadProject) {
      if (projectId) {
        // load a project by query param ID
        if (!shareToken) {
          shareToken = '';
        }

        this.projectLoadService.load(Number.parseInt(projectId), projectName, shareToken).subscribe(() => { }, (response) => {
          let error = response && response.error ? response.error.error : 'unknown';

          let msg = '';

          if (error == 'no-permission') {
            msg = 'designer.project.open-no-permission-error';
            error = undefined;
          } else {
            msg = 'designer.project.open-error';
          }

          this.errorDialogService.show(msg, error).subscribe(() => {
            this.projectLoadService.new();
          });
        });
      } else if (this.userService.isLoggedIn() && this.userService.getAutoLoadProjectId()) {
        // restore the last saved project
        this.projectLoadService.load(this.userService.getAutoLoadProjectId(), null).subscribe(() => { }, (response) => {
          let msg = 'designer.project.open-error';
          let error = response && response.error ? response.error.error : 'unknown';

          this.errorDialogService.show(msg, error).subscribe(() => {
            this.projectLoadService.new();
          });
        });
      } else {
        // load the new project template
        this.projectLoadService.template();
      }
    } else {
      this.projectLoadService.new();
    }
  }

  private calcTotalMenuHeight() {
    this.totalMenuHeightPx = this.designerMenuSizePx + this.splitGutterSizePx + this.configService.menuHeightPx;
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
    if (tab == 'settings') {
      this.fixtureService.settingsSelection = true;
    } else {
      this.fixtureService.settingsSelection = false;
    }

    this.currentTab = tab;
  }

  openFixturePool() {
    this.fixturePoolService.open();
  }

  projectNew() {
    this.warningDialogService.show('designer.misc.warning-proceed-unsaved').pipe(map(result => {
      if (result) {
        this.projectLoadService.new();
      }
    })).subscribe();
  }

  projectOpen() {
    this.warningDialogService.show('designer.misc.warning-proceed-unsaved').pipe(map(result => {
      if (result) {
        this.userEnsureLoginService.login().subscribe(() => {
          this.modalService.show(ProjectBrowserComponent, { keyboard: true, ignoreBackdropClick: false });
        });
      }
    })).subscribe();
  }

  projectSave() {
    this.userEnsureLoginService.login().subscribe(() => {
      this.projectService.save(this.projectService.project).subscribe(() => {
        let msg = 'designer.project.save-success';
        let title = 'designer.project.save-success-title';

        this.translateService.get([msg, title]).subscribe(result => {
          this.toastrService.success(result[msg], result[title]);
        });

        if (this.projectService.project.id) {
          this.userService.setAutoLoadProjectId(this.projectService.project.id);
        }
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
    this.warningDialogService.show('designer.misc.warning-proceed-unsaved').pipe(map(result => {
      if (result) {
        this.modalService.show(ProjectImportComponent, { keyboard: true, ignoreBackdropClick: false });
      }
    })).subscribe();
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
    if (!this.projectService.project.id) {
      // a save is required first
      this.errorDialogService.show('designer.project.share-no-save').subscribe();
      return;
    }

    // ignore backdrop click, because selecting the link text will also close the modal
    this.modalService.show(ProjectShareComponent, { keyboard: true, ignoreBackdropClick: true });
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

    if ((event.ctrlKey || event.metaKey) && event.key == 'n') {
      this.projectNew();
      event.stopPropagation();
      event.preventDefault();
    }

    if ((event.ctrlKey || event.metaKey) && event.key == 's') {
      this.projectSave();
      event.stopPropagation();
      event.preventDefault();
    }

    if ((event.ctrlKey || event.metaKey) && event.key == 'o') {
      this.projectOpen();
      event.stopPropagation();
      event.preventDefault();
    }
  }

  switchLanguage(language: string) {
    this.translateService.use(language);
    localStorage.setItem('language', language);
  }

  projectSettings() {
    let bsModalRef = this.modalService.show(ProjectSettingsComponent, { keyboard: true, ignoreBackdropClick: false, class: '', initialState: { project: this.projectService.project } });
  }

}
