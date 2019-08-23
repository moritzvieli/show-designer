import { Component, ViewChild, AfterViewInit, ViewEncapsulation, Input, HostListener, OnInit } from '@angular/core';
import { PreviewComponent } from '../preview/preview.component';
import { TimelineComponent } from '../timeline/timeline.component';
import { TranslateService } from '@ngx-translate/core';
import { ProjectService } from '../services/project.service';
import Split from 'split.js';
import { ConfigService } from '../services/config.service';
import { FixturePoolService } from '../services/fixture-pool.service';
import { HotkeyTargetExcludeService } from '../services/hotkey-target-exclude.service';
import { UserRegisterComponent } from '../user/user-register/user-register.component';
import { BsModalService } from 'ngx-bootstrap';
import { UserService } from '../services/user.service';
import { UserEnsureLoginService } from '../services/user-ensure-login.service';
import { ToastrService } from 'ngx-toastr';
import { ProjectBrowserComponent } from '../project-browser/project-browser.component';
import { ProjectLoadService } from '../services/project-load.service';
import { ProjectImportComponent } from '../project-import/project-import.component';
import { ProjectShareComponent } from '../project-share/project-share.component';
import { ActivatedRoute } from '@angular/router';
import { WarningDialogService } from '../services/warning-dialog.service';
import { map } from 'rxjs/operators';
import { ErrorDialogService } from '../services/error-dialog.service';

@Component({
  selector: 'lib-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MainComponent implements AfterViewInit, OnInit {

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
    private configService: ConfigService,
    private fixturePoolService: FixturePoolService,
    private hotkeyTargetExcludeService: HotkeyTargetExcludeService,
    private modalService: BsModalService,
    public userService: UserService,
    private userEnsureLoginService: UserEnsureLoginService,
    private toastrService: ToastrService,
    private projectLoadService: ProjectLoadService,
    private activatedRoute: ActivatedRoute,
    private warningDialogService: WarningDialogService,
    private errorDialogService: ErrorDialogService
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

    let projectId = this.activatedRoute.snapshot.queryParamMap.get('id');
    let shareToken = this.activatedRoute.snapshot.queryParamMap.get('token');

    if (projectId) {
      // load a project by query param ID
      if (!shareToken) {
        shareToken = '';
      }

      this.projectLoadService.load(Number.parseInt(projectId), shareToken).subscribe(() => { }, (response) => {
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
      this.projectLoadService.load(this.userService.getAutoLoadProjectId()).subscribe(() => { }, (response) => {
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
    if (tab == 'properties' && this.currentTab != 'properties') {
      // Nothing to do currently
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

}
