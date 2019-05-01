import { PreviewComponent } from './preview/preview.component';
import { Component, AfterViewInit, ViewChild } from '@angular/core';
import Split from 'split.js';
import { TranslateService } from '@ngx-translate/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FixturePoolComponent } from './fixture-pool/fixture-pool.component';
import { TimelineComponent } from './timeline/timeline.component';
import { ProjectService } from './services/project.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  currentTab: string = 'properties';

  @ViewChild(PreviewComponent)
  previewComponent: PreviewComponent;

  @ViewChild(TimelineComponent)
  timelineComponent: TimelineComponent;

  constructor(
    private translateService: TranslateService,
    private modalService: BsModalService,
    private projectService: ProjectService
  ) {

    this.translateService.use('en');
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
    let gutterSize: number = 12.8;

    Split(['#row1', '#row2', '#row3'], {
      sizes: [50, 32, 18],
      direction: 'vertical',
      cursor: 'row-resize',
      snapOffset: 0,
      gutterSize: gutterSize,
      onDrag: this.onResize.bind(this)
    });

    Split(['#scenes', '#presets', '#preview'], {
      sizes: [15, 15, 70],
      snapOffset: 0,
      gutterSize: gutterSize,
      onDrag: this.onResize.bind(this)
    });

    Split(['#capabilities', '#fixtures', '#masterDimmer'], {
      sizes: [78, 16, 6],
      snapOffset: 0,
      gutterSize: gutterSize,
      onDrag: this.onResize.bind(this)
    });

    this.onResize();
  }

  openTab(tab: string) {
    if (tab == 'properties' && this.currentTab != 'properties') {
      // Nothing to do currently
    }

    this.currentTab = tab;
  }

  openFixturePool() {
    let bsModalRef = this.modalService.show(FixturePoolComponent, { keyboard: false, ignoreBackdropClick: true, class: 'modal-full' });
  }

  projectOpen() {
    // TODO
  }

  projectClose() {
    // TODO
  }

  projectSave() {
    // TODO
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

}
