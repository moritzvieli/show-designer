import { PreviewComponent } from './preview/preview.component';
import { Component, AfterViewInit, ViewChild } from '@angular/core';
import Split from 'split.js';
import { TranslateService } from '@ngx-translate/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FixturePoolComponent } from './fixture-pool/fixture-pool.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  @ViewChild(PreviewComponent)
  previewComponent: PreviewComponent;

  constructor(
    private translateService: TranslateService,
    private modalService: BsModalService
  ) {

    this.translateService.use('en');
  }

  private onResize() {
    if (this.previewComponent) {
      this.previewComponent.onResize();
    }
  }

  ngAfterViewInit(): void {
    // Set up the splitter
    let gutterSize: number = 12.8;

    Split(['#row1', '#row2', '#row3'], {
      sizes: [50, 31, 19],
      direction: 'vertical',
      cursor: 'row-resize',
      snapOffset: 0,
      gutterSize: gutterSize,
      onDrag: this.onResize.bind(this)
    });

    Split(['#scenes', '#preview'], {
      sizes: [30, 70],
      snapOffset: 0,
      gutterSize: gutterSize,
      onDrag: this.onResize.bind(this)
    });

    Split(['#properties', '#fixtures'], {
      sizes: [80, 20],
      snapOffset: 0,
      gutterSize: gutterSize,
      onDrag: this.onResize.bind(this)
    });

    this.onResize();
  }

  openFixturePool() {
    let bsModalRef = this.modalService.show(FixturePoolComponent, {class: 'modal-lg'});
  }

}
